import type { MentorSessionType, Prisma } from "@prisma/client";
import { MentorProfileStatus, MentorServiceStatus } from "@prisma/client";

import { AppError } from "../../common/errors/app-error";
import { findMentorProfileByUserId } from "../mentor-profile/mentor-profile.repository";
import { findOnboardingCategoryById } from "../onboarding/onboarding-category/onboarding-category.repository";

import type {
  FindMentorServicesOptions,
  FindPublicMentorServicesOptions,
} from "./mentor-service.repository";
import {
  createMentorService,
  findMentorServiceById,
  findMentorServiceBySlug,
  findMentorServicesByMentor,
  findPublicMentorServiceBySlug,
  updateMentorService,
  findPublicMentorServices,
  deleteMentorService,
} from "./mentor-service.repository";
import { generateMentorServiceSlug } from "./mentor-service.utils";

interface CreateMentorServiceInput {
  userId: string;

  categoryId: string;

  title: string;

  slug?: string;

  shortDescription?: string;

  description: string;

  priceInPaise: number;

  durationInMinutes: number;

  sessionType: MentorSessionType;

  thumbnailUrl?: string;

  bannerUrl?: string;

  tags?: string[];

  sortOrder?: number;
}

interface UpdateMentorServiceInput {
  userId: string;

  serviceId: string;

  categoryId?: string;

  title?: string;

  slug?: string;

  shortDescription?: string;

  description?: string;

  priceInPaise?: number;

  durationInMinutes?: number;

  sessionType?: MentorSessionType;

  thumbnailUrl?: string;

  bannerUrl?: string;

  tags?: string[];

  status?: MentorServiceStatus;

  sortOrder?: number;
}

interface ServiceLifecycleInput {
  userId: string;
  serviceId: string;
}

export const createMentorServiceService = async (
  input: CreateMentorServiceInput,
) => {
  const mentorProfile = await findMentorProfileByUserId(input.userId);

  if (!mentorProfile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  if (mentorProfile.status === MentorProfileStatus.SUSPENDED) {
    throw new AppError(
      "Suspended mentors cannot create services",
      403,
      "MENTOR_PROFILE_SUSPENDED",
    );
  }

  if (mentorProfile.approvalStatus !== "APPROVED") {
    throw new AppError(
      "Mentor profile is not approved",
      403,
      "MENTOR_PROFILE_NOT_APPROVED",
    );
  }

  const category = await findOnboardingCategoryById(input.categoryId);
  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }

  if (!category.isActive) {
    throw new AppError("Category is inactive", 400, "CATEGORY_INACTIVE");
  }

  let resolvedSlug: string;
  if (input.slug) {
    resolvedSlug = generateMentorServiceSlug(input.slug);
    const existingSlug = await findMentorServiceBySlug(resolvedSlug);
    if (existingSlug) {
      throw new AppError(
        "Service slug already exists",
        409,
        "SERVICE_SLUG_ALREADY_EXISTS",
      );
    }
  } else {
    const baseSlug = generateMentorServiceSlug(input.title);
    resolvedSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existingSlug = await findMentorServiceBySlug(resolvedSlug);
      if (!existingSlug) {
        break;
      }
      resolvedSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return createMentorService({
    title: input.title,

    slug: resolvedSlug,

    shortDescription: input.shortDescription,

    description: input.description,

    priceInPaise: input.priceInPaise,

    durationInMinutes: input.durationInMinutes,

    sessionType: input.sessionType,

    thumbnailUrl: input.thumbnailUrl,

    bannerUrl: input.bannerUrl,

    tags: input.tags as Prisma.InputJsonValue,

    status: MentorServiceStatus.DRAFT,

    sortOrder: input.sortOrder ?? 0,

    mentorProfile: {
      connect: {
        id: mentorProfile.id,
      },
    },

    category: {
      connect: {
        id: input.categoryId,
      },
    },
  });
};

export const updateMentorServiceService = async (
  input: UpdateMentorServiceInput,
) => {
  const mentorProfile = await findMentorProfileByUserId(input.userId);

  if (!mentorProfile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  if (mentorProfile.status === MentorProfileStatus.SUSPENDED) {
    throw new AppError(
      "Suspended mentors cannot update services",
      403,
      "MENTOR_PROFILE_SUSPENDED",
    );
  }

  if (mentorProfile.approvalStatus !== "APPROVED") {
    throw new AppError(
      "Mentor profile is not approved",
      403,
      "MENTOR_PROFILE_NOT_APPROVED",
    );
  }

  const existingService = await findMentorServiceById(input.serviceId);

  if (!existingService) {
    throw new AppError(
      "Mentor service not found",
      404,
      "MENTOR_SERVICE_NOT_FOUND",
    );
  }

  if (existingService.mentorProfileId !== mentorProfile.id) {
    throw new AppError(
      "You do not own this service",
      403,
      "MENTOR_SERVICE_FORBIDDEN",
    );
  }

  if (input.categoryId) {
    const category = await findOnboardingCategoryById(input.categoryId);
    if (!category) {
      throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }
    if (!category.isActive) {
      throw new AppError("Category is inactive", 400, "CATEGORY_INACTIVE");
    }
  }

  let normalizedSlug: string | undefined;

  if (input.slug) {
    normalizedSlug = generateMentorServiceSlug(input.slug);

    const slugOwner = await findMentorServiceBySlug(normalizedSlug);

    if (slugOwner && slugOwner.id !== existingService.id) {
      throw new AppError(
        "Service slug already exists",
        409,
        "SERVICE_SLUG_ALREADY_EXISTS",
      );
    }
  }

  return updateMentorService(input.serviceId, {
    category: input.categoryId
      ? {
          connect: {
            id: input.categoryId,
          },
        }
      : undefined,

    title: input.title,

    slug: normalizedSlug,

    shortDescription: input.shortDescription,

    description: input.description,

    priceInPaise: input.priceInPaise,

    durationInMinutes: input.durationInMinutes,

    sessionType: input.sessionType,

    thumbnailUrl: input.thumbnailUrl,

    bannerUrl: input.bannerUrl,

    tags: input.tags as Prisma.InputJsonValue,

    sortOrder: input.sortOrder,
  });
};

export const getOwnMentorServicesService = async (
  userId: string,
  options: FindMentorServicesOptions,
) => {
  const mentorProfile = await findMentorProfileByUserId(userId);

  if (!mentorProfile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  const { items, totalItems } = await findMentorServicesByMentor(
    mentorProfile.id,
    options,
  );

  const totalPages = Math.ceil(totalItems / options.limit);
  const hasNextPage = options.page < totalPages;
  const hasPreviousPage = options.page > 1;

  return {
    items,
    pagination: {
      currentPage: options.page,
      totalPages,
      totalItems,
      limit: options.limit,
      hasNextPage,
      hasPreviousPage,
    },
  };
};

type PublicServiceWithRelations = Prisma.MentorServiceGetPayload<{
  include: { category: true; mentorProfile: true };
}>;

const mapToPublicService = (service: PublicServiceWithRelations) => ({
  id: service.id,
  title: service.title,
  slug: service.slug,
  shortDescription: service.shortDescription,
  description: service.description,
  thumbnailUrl: service.thumbnailUrl,
  bannerUrl: service.bannerUrl,
  priceInPaise: service.priceInPaise,
  durationInMinutes: service.durationInMinutes,
  sessionType: service.sessionType,
  tags: service.tags,
  category: {
    id: service.category.id,
    name: service.category.name,
    slug: service.category.slug,
  },
  mentor: {
    slug: service.mentorProfile.slug,
    profileImageUrl: service.mentorProfile.profileImageUrl,
    headline: service.mentorProfile.headline,
  },
});

export const getPublicMentorServicesService = async (
  options: FindPublicMentorServicesOptions,
) => {
  const { items, totalItems } = await findPublicMentorServices(options);

  const totalPages = Math.ceil(totalItems / options.limit);
  const hasNextPage = options.page < totalPages;
  const hasPreviousPage = options.page > 1;

  const publicItems = items.map(mapToPublicService);

  return {
    items: publicItems,
    pagination: {
      currentPage: options.page,
      totalPages,
      totalItems,
      limit: options.limit,
      hasNextPage,
      hasPreviousPage,
    },
  };
};

export const getPublicMentorServiceService = async (slug: string) => {
  const service = await findPublicMentorServiceBySlug(slug);

  if (!service) {
    throw new AppError(
      "Mentor service not found",
      404,
      "MENTOR_SERVICE_NOT_FOUND",
    );
  }

  return mapToPublicService(service);
};

const validateAndGetServiceOwnership = async (
  userId: string,
  serviceId: string,
) => {
  const mentorProfile = await findMentorProfileByUserId(userId);

  if (!mentorProfile) {
    throw new AppError(
      "Mentor profile not found",
      404,
      "MENTOR_PROFILE_NOT_FOUND",
    );
  }

  if (mentorProfile.status === MentorProfileStatus.SUSPENDED) {
    throw new AppError(
      "Suspended mentors cannot perform lifecycle actions",
      403,
      "MENTOR_PROFILE_SUSPENDED",
    );
  }

  if (mentorProfile.approvalStatus !== "APPROVED") {
    throw new AppError(
      "Mentor profile is not approved",
      403,
      "MENTOR_PROFILE_NOT_APPROVED",
    );
  }

  const existingService = await findMentorServiceById(serviceId);

  if (!existingService) {
    throw new AppError(
      "Mentor service not found",
      404,
      "MENTOR_SERVICE_NOT_FOUND",
    );
  }

  if (existingService.mentorProfileId !== mentorProfile.id) {
    throw new AppError(
      "You do not own this service",
      403,
      "MENTOR_SERVICE_FORBIDDEN",
    );
  }

  return existingService;
};

export const publishMentorServiceService = async (
  input: ServiceLifecycleInput,
) => {
  const existingService = await validateAndGetServiceOwnership(
    input.userId,
    input.serviceId,
  );

  if (existingService.status === MentorServiceStatus.ARCHIVED) {
    throw new AppError(
      "Cannot publish an archived service",
      400,
      "INVALID_STATE_TRANSITION",
    );
  }

  if (existingService.status === MentorServiceStatus.PUBLISHED) {
    throw new AppError(
      "Service is already published",
      400,
      "INVALID_STATE_TRANSITION",
    );
  }

  const publishedAt = existingService.publishedAt ?? new Date();

  return updateMentorService(input.serviceId, {
    status: MentorServiceStatus.PUBLISHED,
    publishedAt,
  });
};

export const unpublishMentorServiceService = async (
  input: ServiceLifecycleInput,
) => {
  const existingService = await validateAndGetServiceOwnership(
    input.userId,
    input.serviceId,
  );

  if (existingService.status === MentorServiceStatus.ARCHIVED) {
    throw new AppError(
      "Cannot unpublish an archived service",
      400,
      "INVALID_STATE_TRANSITION",
    );
  }

  if (existingService.status === MentorServiceStatus.DRAFT) {
    throw new AppError(
      "Service is already a draft",
      400,
      "INVALID_STATE_TRANSITION",
    );
  }

  return updateMentorService(input.serviceId, {
    status: MentorServiceStatus.DRAFT,
  });
};

export const archiveMentorServiceService = async (
  input: ServiceLifecycleInput,
) => {
  const existingService = await validateAndGetServiceOwnership(
    input.userId,
    input.serviceId,
  );

  if (existingService.status === MentorServiceStatus.ARCHIVED) {
    throw new AppError(
      "Service is already archived",
      400,
      "INVALID_STATE_TRANSITION",
    );
  }

  const archivedAt = existingService.archivedAt ?? new Date();

  return updateMentorService(input.serviceId, {
    status: MentorServiceStatus.ARCHIVED,
    archivedAt,
  });
};

export const canDeleteMentorService = async (
  _serviceId: string,
): Promise<boolean> => {
  // Placeholder logic (future: verify booking presence)
  return true;
};

export const deleteMentorServiceService = async (
  input: ServiceLifecycleInput,
) => {
  await validateAndGetServiceOwnership(input.userId, input.serviceId);

  const canDelete = await canDeleteMentorService(input.serviceId);

  if (canDelete) {
    return deleteMentorService(input.serviceId);
  } else {
    throw new AppError(
      "Cannot delete service with existing bookings",
      400,
      "CANNOT_DELETE_SERVICE_WITH_BOOKINGS",
    );
  }
};
