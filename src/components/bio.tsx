/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import styled from "styled-components"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            github
            medium
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social

  return (
    <Container>
      <Avatar>
        <StaticImage
          layout="fixed"
          formats={["auto", "webp", "avif"]}
          src="../images/simpson_avatar_circle.png"
          width={100}
          height={100}
          quality={95}
          alt="Profile picture"
        />
      </Avatar>
      {author?.name && (
        <Description>
          <SummaryWrapper>
            <Summary dangerouslySetInnerHTML={{ __html: author?.summary }} />
          </SummaryWrapper>
          <RefWrapper>
            <LinkWrapper>
              <div>
                <a
                  href={`https://github.com/${social?.github}`}
                  target="_blank"
                >
                  <StaticImage
                    width={25}
                    src="../images/github_logo.png"
                    alt="github_logo"
                  />
                </a>
              </div>
              <div>
                <a
                  href={`https://medium.com/${social?.medium}`}
                  target="_blank"
                >
                  <StaticImage
                    width={25}
                    src="../images/medium_logo.png"
                    alt="medium_logo"
                  />
                </a>
              </div>
            </LinkWrapper>
            <CountryWrapper>
              <div>📍 South Korea</div>
            </CountryWrapper>
          </RefWrapper>
        </Description>
      )}
    </Container>
  )
}

export default Bio

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: var(--spacing-8);
`
const Avatar = styled.div`
  img {
    border-radius: 50%;
  }

  margin-right: var(--spacing-4);
`

const Description = styled.div`
  display: flex;
  flex-direction: column;
`

const SummaryWrapper = styled.div`
  margin-bottom: var(--spacing-4);
`

const Summary = styled.p``

const RefWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const LinkWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`
const CountryWrapper = styled.div``
