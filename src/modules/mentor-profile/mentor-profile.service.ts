import type { Prisma } from "@prisma/client";
import { MentorProfileStatus } from "@prisma/client";

import { AppError } from "../../common/errors/app-error";

import {
  findMentorProfileBySlug,
  findMentorProfileByUserId,
  findPublicMentorProfileBySlug,
  updateMentorProfile,
} from "./mentor-profile.repository";
import { generateMentorSlug } from "./mentor-profile.utils";

interface UpdateMentorProfileInput {
  userId: string;

  slug?: string;

  headline?: string;

  bio?: string;

  profileImageUrl?: string;

  expertiseTags?: string[];

  socialLinks?: {
    linkedin?: string;

    twitter?: string;

    youtube?: string;

    website?: string;
  };

  status?: MentorProfileStatus;
}

export const getOwnMentorProfileService = async (userId: string) => {
  const profile = await findMentorProfileByUserId(userId);

  if (!profile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  return profile;
};

export const getPublicMentorProfileService = async (slug: string) => {
  const profile = await findPublicMentorProfileBySlug(slug);

  if (!profile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  return profile;
};

export const updateMentorProfileService = async (
  input: UpdateMentorProfileInput,
) => {
  const existingProfile = await findMentorProfileByUserId(input.userId);

  if (!existingProfile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  if (existingProfile.status === MentorProfileStatus.SUSPENDED) {
    throw new AppError(
      "Suspended mentor profiles cannot be updated",
      403,
      "MENTOR_PROFILE_SUSPENDED",
    );
  }

  let normalizedSlug: string | undefined;

  if (input.slug) {
    normalizedSlug = generateMentorSlug(input.slug);

    const slugOwner = await findMentorProfileBySlug(normalizedSlug);

    if (slugOwner && slugOwner.id !== existingProfile.id) {
      throw new AppError("Slug already taken", 409, "SLUG_ALREADY_EXISTS");
    }
  }

  return updateMentorProfile(input.userId, {
    slug: normalizedSlug,

    headline: input.headline,

    bio: input.bio,

    profileImageUrl: input.profileImageUrl,

    expertiseTags: input.expertiseTags as Prisma.InputJsonValue,

    socialLinks: input.socialLinks as Prisma.InputJsonValue,

    status: input.status,
  });
};
