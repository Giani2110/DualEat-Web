import slugify from 'slugify'; 

export async function generateUniqueSlug(baseText: string, model: any): Promise<string> {
    const baseSlug = slugify(baseText, { 
        strict: true,
    });
    
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await model.findFirst({
            where: { slug },
            select: { id: true }
        });

        if (!existing) {
            return slug; 
        }

        slug = `${baseSlug}${counter}`; 
        counter++;
    }
}

export async function generateReadableSlug(baseText: string, model: any): Promise<string> {
  const baseSlug = slugify(baseText, {
    replacement: "_", 
    lower: true,
    strict: true,    
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await model.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}_${counter}`;
    counter++;
  }
}