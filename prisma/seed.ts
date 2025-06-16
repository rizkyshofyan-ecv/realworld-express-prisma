import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Start seeding...');

  // Create users
  const user1 = await prisma.user.upsert({
    where: { username: 'johndoe' },
    update: {},
    create: {
      email: 'john@example.com',
      username: 'johndoe',
      password: await hashPassword('password123'),
      bio: 'I am a software developer interested in web technologies.',
      image: 'https://i.pravatar.cc/200?u=johndoe',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: 'janedoe' },
    update: {},
    create: {
      email: 'jane@example.com',
      username: 'janedoe',
      password: await hashPassword('password123'),
      bio: 'Full-stack developer with a passion for UI/UX.',
      image: 'https://i.pravatar.cc/200?u=janedoe',
    },
  });

  console.log(`Created users: ${user1.username}, ${user2.username}`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { tagName: 'javascript' },
      update: {},
      create: { tagName: 'javascript' },
    }),
    prisma.tag.upsert({
      where: { tagName: 'typescript' },
      update: {},
      create: { tagName: 'typescript' },
    }),
    prisma.tag.upsert({
      where: { tagName: 'aws' },
      update: {},
      create: { tagName: 'aws' },
    }),
    prisma.tag.upsert({
      where: { tagName: 'web-security' },
      update: {},
      create: { tagName: 'web-security' },
    }),
    prisma.tag.upsert({
      where: { tagName: 'waf' },
      update: {},
      create: { tagName: 'waf' },
    }),
  ]);

  console.log(`Created ${tags.length} tags`);

  // Create articles
  const article1 = await prisma.article.upsert({
    where: { slug: 'introduction-to-aws-waf' },
    update: {},
    create: {
      title: 'Introduction to AWS WAF',
      slug: 'introduction-to-aws-waf',
      description: 'Learn the basics of AWS Web Application Firewall',
      body: `AWS WAF (Web Application Firewall) is a web application firewall service that helps protect your web applications from common web exploits that could affect application availability, compromise security, or consume excessive resources.

AWS WAF gives you control over how traffic reaches your applications by enabling you to create security rules that block common attack patterns, such as SQL injection or cross-site scripting, and rules that filter out specific traffic patterns you define.

In this article, we'll explore the basics of AWS WAF and how it can help secure your web applications.`,
      authorUsername: 'johndoe',
      tagList: {
        connect: [
          { tagName: 'aws' },
          { tagName: 'web-security' },
          { tagName: 'waf' },
        ],
      },
    },
  });

  const article2 = await prisma.article.upsert({
    where: { slug: 'implementing-aws-waf-with-cloudfront' },
    update: {},
    create: {
      title: 'Implementing AWS WAF with CloudFront',
      slug: 'implementing-aws-waf-with-cloudfront',
      description: 'A step-by-step guide to implementing AWS WAF with CloudFront',
      body: `CloudFront is Amazon's Content Delivery Network (CDN) that securely delivers data, videos, applications, and APIs to customers globally with low latency and high transfer speeds. When combined with AWS WAF, it provides an additional layer of security for your web applications.

In this tutorial, we'll walk through the process of implementing AWS WAF with CloudFront to protect your web applications from common security threats.

We'll cover:
1. Setting up a CloudFront distribution
2. Creating AWS WAF rules
3. Associating the WAF WebACL with CloudFront
4. Testing the configuration`,
      authorUsername: 'johndoe',
      tagList: {
        connect: [
          { tagName: 'aws' },
          { tagName: 'web-security' },
          { tagName: 'waf' },
        ],
      },
    },
  });

  const article3 = await prisma.article.upsert({
    where: { slug: 'typescript-best-practices' },
    update: {},
    create: {
      title: 'TypeScript Best Practices',
      slug: 'typescript-best-practices',
      description: 'Learn the best practices for TypeScript development',
      body: `TypeScript has become increasingly popular in the JavaScript ecosystem, offering strong typing and object-oriented features that make code more maintainable and less prone to runtime errors.

In this article, we'll explore some best practices for TypeScript development that can help you write cleaner, more efficient code.

Topics covered include:
- Type annotations and inference
- Interface vs Type aliases
- Generics
- Utility types
- Error handling
- Async/await patterns`,
      authorUsername: 'janedoe',
      tagList: {
        connect: [
          { tagName: 'javascript' },
          { tagName: 'typescript' },
        ],
      },
    },
  });

  console.log(`Created articles: ${article1.title}, ${article2.title}, ${article3.title}`);

  // Create comments
  const comment1 = await prisma.comment.create({
    data: {
      body: 'Great introduction to AWS WAF! This will be very helpful for my upcoming project.',
      authorUsername: 'janedoe',
      articleSlug: 'introduction-to-aws-waf',
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      body: 'Thanks for the detailed guide on implementing WAF with CloudFront. I was able to follow along and set it up for my application.',
      authorUsername: 'janedoe',
      articleSlug: 'implementing-aws-waf-with-cloudfront',
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      body: 'I appreciate the TypeScript best practices. The section on generics was particularly helpful.',
      authorUsername: 'johndoe',
      articleSlug: 'typescript-best-practices',
    },
  });

  console.log(`Created ${3} comments`);

  // Set up user follows
  await prisma.user.update({
    where: { username: 'janedoe' },
    data: {
      follows: {
        connect: { username: 'johndoe' },
      },
    },
  });

  // Set up article favorites
  await prisma.user.update({
    where: { username: 'janedoe' },
    data: {
      favorites: {
        connect: [
          { slug: 'introduction-to-aws-waf' },
          { slug: 'implementing-aws-waf-with-cloudfront' },
        ],
      },
    },
  });

  await prisma.user.update({
    where: { username: 'johndoe' },
    data: {
      favorites: {
        connect: [
          { slug: 'typescript-best-practices' },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
