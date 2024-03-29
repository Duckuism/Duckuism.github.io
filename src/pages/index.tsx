import * as React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import styled from "styled-components"

const BlogIndex = () => {
  const data = useStaticQuery<Queries.BlogIndexQuery>(graphql`
    query BlogIndex {
      site {
        siteMetadata {
          title
        }
      }
      allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
        nodes {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  `)

  const siteTitle = data.site?.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  const isBrowser = () => typeof window !== "undefined"

  if (!isBrowser()) return null

  if (posts.length === 0) {
    return (
      <Layout location={window.location} title={siteTitle}>
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={window.location} title={siteTitle}>
      <Bio />
      <ol style={{ listStyle: `none` }}>
        {posts.map((post) => {
          const title = post.frontmatter?.title || post.fields?.slug

          return (
            <li key={post.fields?.slug}>
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields?.slug ?? ""} itemProp="url">
                      <TitleText itemProp="headline">{title}</TitleText>
                    </Link>
                  </h2>
                  <small>{post.frontmatter?.date}</small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html:
                        (post.frontmatter?.description || post.excerpt) ?? "",
                    }}
                    itemProp="description"
                  />
                </section>
              </article>
            </li>
          )
        })}
      </ol>
    </Layout>
  )
}

export default BlogIndex

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="All posts" description="" />

const TitleText = styled.span`
  font-weight: 600;
`
