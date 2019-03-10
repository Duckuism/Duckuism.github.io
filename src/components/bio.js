/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react"
import { StaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import { rhythm } from "../utils/typography"

function Bio() {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author, social } = data.site.siteMetadata
        return (
          <div
            style={{
              display: `flex`,
              marginBottom: rhythm(2.5),
              alignItems: `center`,
            }}
          >
            <Image
              fixed={data.avatar.childImageSharp.fixed}
              alt={author}
              style={{
                marginRight: rhythm(1 / 2),
                marginBottom: 0,
                minWidth: 50,
                borderRadius: `100%`,
              }}
              imgStyle={{
                borderRadius: `50%`,
              }}
            />
            <div 
              style={{
                flexDirection:`column`,
              }}>
            <p>
            A developer who dreams of becoming an original and loves art, painting, and design. <span role="img" aria-label="">💫</span>
            </p>
            <div>
              {` `}
              <a href={`https://github.com/${social.github}`}>
                Github
              </a>
              {` `}
              <a href={`https://www.facebook.com/${social.facebook}`}>
                Facebook
              </a>
              {` `}
              <a href={`https://medium.com/${social.medium}`}>
                Medium
              </a>
            </div>
            </div>
          </div>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 50, height: 50) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        author
        social {
          github
          facebook
          medium
        }
      }
    }
  }
`

export default Bio
