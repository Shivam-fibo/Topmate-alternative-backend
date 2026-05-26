import slugify from "slugify";

export const generateMentorSlug = (value: string): string => {
  return slugify(value, {
    lower: true,

    strict: true,

    trim: true,
  });
};
