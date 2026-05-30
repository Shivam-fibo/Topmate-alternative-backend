import slugify from "slugify";

export const generateMentorServiceSlug = (value: string): string => {
  return slugify(value, {
    lower: true,

    strict: true,

    trim: true,
  });
};
