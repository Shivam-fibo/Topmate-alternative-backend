import { OnboardingFieldType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { AppError } from "../../../common/errors/app-error";
import { generateMentorSlug } from "../../mentor-profile/mentor-profile.utils";

import {
  addMentorRoleToUser,
  findSubmissionById,
  updateSubmissionReview,
  createInitialMentorProfile,
  findMentorProfileBySlug,
} from "./onboarding-submission.repository";
import {
  createSubmission,
  findCategoryWithFields,
  findPendingSubmissionByUserId,
} from "./onboarding-submission.repository";

interface SubmissionAnswerInput {
  fieldId: string;

  value: Prisma.InputJsonValue;
}

interface CreateSubmissionInput {
  userId: string;

  categoryId: string;

  answers: SubmissionAnswerInput[];
}

interface ReviewSubmissionInput {
  submissionId: string;

  status: "APPROVED" | "REJECTED";

  reviewNotes?: string;
}
const validateFieldValue = (
  fieldType: OnboardingFieldType,

  value: unknown,
) => {
  switch (fieldType) {
    case OnboardingFieldType.TEXT:
    case OnboardingFieldType.TEXTAREA:
      return typeof value === "string";

    case OnboardingFieldType.NUMBER:
      return typeof value === "number";

    case OnboardingFieldType.SELECT:
      return typeof value === "string";

    case OnboardingFieldType.MULTI_SELECT:
      return Array.isArray(value);

    case OnboardingFieldType.FILE:
      return typeof value === "object" && value !== null;

    case OnboardingFieldType.DATE:
      return typeof value === "string";

    default:
      return false;
  }
};

export const createOnboardingSubmissionService = async (
  input: CreateSubmissionInput,
) => {
  const existingPendingSubmission = await findPendingSubmissionByUserId(
    input.userId,
  );

  if (existingPendingSubmission) {
    throw new AppError(
      "Pending onboarding submission already exists",
      409,
      "PENDING_SUBMISSION_ALREADY_EXISTS",
    );
  }

  const category = await findCategoryWithFields(input.categoryId);

  if (!category) {
    throw new AppError(
      "Onboarding category not found",
      404,
      "ONBOARDING_CATEGORY_NOT_FOUND",
    );
  }

  const fieldMap = new Map(category.fields.map((field) => [field.id, field]));

  for (const field of category.fields) {
    if (!field.isRequired) {
      continue;
    }

    const submittedAnswer = input.answers.find(
      (answer) => answer.fieldId === field.id,
    );

    if (!submittedAnswer) {
      throw new AppError(
        `${field.label} is required`,
        400,
        "REQUIRED_FIELD_MISSING",
      );
    }
  }

  for (const answer of input.answers) {
    const field = fieldMap.get(answer.fieldId);

    if (!field) {
      throw new AppError("Invalid field submitted", 400, "INVALID_FIELD");
    }

    const isValid = validateFieldValue(field.fieldType, answer.value);

    if (!isValid) {
      throw new AppError(
        `Invalid value for ${field.label}`,
        400,
        "INVALID_FIELD_VALUE",
      );
    }
  }

  return createSubmission({
    userId: input.userId,

    categoryId: input.categoryId,

    answers: input.answers,
  });
};

export const reviewSubmissionService = async (input: ReviewSubmissionInput) => {
  const submission = await findSubmissionById(input.submissionId);

  if (!submission) {
    throw new AppError("Submission not found", 404, "SUBMISSION_NOT_FOUND");
  }

  if (submission.status !== "PENDING") {
    throw new AppError(
      "Submission already reviewed",
      400,
      "SUBMISSION_ALREADY_REVIEWED",
    );
  }

  const updatedSubmission = await updateSubmissionReview(
    input.submissionId,

    input.status,

    input.reviewNotes,
  );

  if (input.status === "APPROVED") {
    await addMentorRoleToUser(submission.userId);

    const userEmail = (submission as any).user.email;
    const emailPrefix = userEmail.split("@")[0];
    let baseSlug = generateMentorSlug(emailPrefix);

    if (baseSlug.length < 3) {
      baseSlug = `${baseSlug}-mentor`;
    }

    let finalSlug = baseSlug;
    let suffix = 1;
    while (true) {
      const existing = await findMentorProfileBySlug(finalSlug);
      if (!existing) {
        break;
      }
      finalSlug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    await createInitialMentorProfile(submission.userId, finalSlug);
  }

  return updatedSubmission;
};
