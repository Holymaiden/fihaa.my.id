import Head from 'next/head';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  author?: string;
}

const defaultMeta = {
  title: 'M. Fiqri Haikhar Anwar - Software Engineer Portfolio',
  description:
    'Experienced Software Engineer specializing in React, Next.js, Node.js, Golang, Laravel, React Native, Elysia.js, and modern web technologies. Based in Makassar, Indonesia.',
  image: '/images/fihaa.png',
  url: 'https://fihaa.my.id',
  type: 'website' as const,
  author: 'M. Fiqri Haikhar Anwar',
};

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
  author,
}) => {
  const meta = {
    title: title ? `${title} | ${defaultMeta.title}` : defaultMeta.title,
    description: description || defaultMeta.description,
    image: image || defaultMeta.image,
    url: url || defaultMeta.url,
    author: author || defaultMeta.author,
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebSite',
    name: meta.title,
    description: meta.description,
    url: meta.url,
    author: {
      '@type': 'Person',
      name: meta.author,
      url: defaultMeta.url,
    },
    ...(type === 'article' &&
      publishedTime && {
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        keywords: tags?.join(', '),
      }),
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="author" content={meta.author} />
      <link rel="canonical" href={meta.url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:site_name" content="Fihaa Portfolio" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <meta name="twitter:creator" content="@fihaa_dev" />

      {/* Additional Meta for Articles */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta
            property="article:modified_time"
            content={modifiedTime || publishedTime}
          />
          <meta property="article:author" content={meta.author} />
          {tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
};

export default MetaTags;
