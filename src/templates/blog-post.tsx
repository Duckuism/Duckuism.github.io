import * as React from "react"
import { HeadProps, Link, useStaticQuery, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import { Comments } from "../components/comments"

const BlogPostTemplate = () => {
  const data = useStaticQuery<Queries.BlogPostBySlugQuery>(graphql`
    query BlogPostBySlug(
      $id: String
      $previousPostId: String
      $nextPostId: String
    ) {
      site {
        siteMetadata {
          title
        }
      }
      markdownRemark(id: { eq: $id }) {
        id
        excerpt(pruneLength: 160)
        html
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          description
        }
      }
      previous: markdownRemark(id: { eq: $previousPostId }) {
        fields {
          slug
        }
        frontmatter {
          title
        }
      }
      next: markdownRemark(id: { eq: $nextPostId }) {
        fields {
          slug
        }
        frontmatter {
          title
        }
      }
    }
  `)

  const { site, markdownRemark: post, previous, next } = data

  const siteTitle = site?.siteMetadata?.title || `Title`

  const isBrowser = () => typeof window !== "undefined"

  if (!isBrowser()) return null

  return (
    <Layout location={window.location} title={siteTitle}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post?.frontmatter?.title}</h1>
          <p>{post?.frontmatter?.date}</p>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post?.html ?? "" }}
          itemProp="articleBody"
        />
        <hr />
        <Comments />
        <footer>
          <Bio />
        </footer>
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous?.fields?.slug ?? ""} rel="prev">
                ← {previous?.frontmatter?.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next?.fields?.slug ?? ""} rel="next">
                {next?.frontmatter?.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export const Head = ({
  data: { markdownRemark: post },
}: HeadProps<Queries.BlogPostBySlugQuery>) => {
  return (
    <Seo
      title={post?.frontmatter?.title ?? ""}
      description={(post?.frontmatter?.description || post?.excerpt) ?? ""}
    />
  )
}

export default BlogPostTemplate
