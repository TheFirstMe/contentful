import React from 'react'
import { graphql } from 'gatsby'
import Helmet from 'react-helmet'
import get from 'lodash/get'
import Img from 'gatsby-image'
import Layout from '../components/layout'

import heroStyles from '../components/hero.module.css'

const comments = props => {
  const order = props.order === true ? "Oldest First" : "Most Recent"
  return (
    <>
      <div>
        {props.comments && <span>{props.comments.length} Comments</span>}
        <button onClick={props.sortComments}>{order}</button>
      </div>
      {props.comments &&
        props.comments.map(comment => (
          <div key={comment.id}>
            <div >
              <div >
                <span >
                  <a href={comment.handle}>{comment.name}</a>
                </span>
                {/* <span className={styles.commentDetailsDate}>
                  {formatDate(comment.timestamp)}
                </span> */}
              </div>
              <p>{comment.message}</p>
            </div>
            <div >
              {comment.replies.map((comment, index) => (
                <div key={index}>
                  <div>
                    <span>
                      <a href={comment.handle}>{comment.name}</a>
                    </span>
                    {/* <span className={styles.commentDetailsDate}>
                      {formatDate(comment.timestamp)}
                    </span> */}
                  </div>
                  <p>{comment.message}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  )
}

class BlogPostTemplate extends React.Component {
  componentDidMount() {
    const ID = this.props.data.contentfulBlogPost.contentful_id
    axios.get("/.netlify/functions/test", {
      params: {
        ID: ID
      }
    }).then(response => {
      this.setState({
        comments: response.data.comments
      })
    }).catch(error => {
      console.log(error)
    })
  }
  sortComments = () => {
    const comments = this.state.comments
    if (!this.state.sorting) {
      const sorted = comments.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
      this.setState({
        comments: sorted,
        sorting: true
      })
    } else {
      const sorted = comments.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
      this.setState({
        comments: sorted,
        sorting: false
      })
    }
  }
  handleChange = evt => {
    evt.persist()
    this.setState({
      [evt.target.name]: evt.target.value
    })
  }
  render() {
    const post = get(this.props, 'data.contentfulBlogPost')
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')

    return (
      <Layout location={this.props.location} >
        <div style={{ background: '#fff' }}>
          <Helmet title={`${post.title} | ${siteTitle}`} />
          <div className={heroStyles.hero}>
            <Img className={heroStyles.heroImage} alt={post.title} fluid={post.heroImage.fluid} />
          </div>
          <div className="wrapper">
            <h1 className="section-headline">{post.title}</h1>
            <p
              style={{
                display: 'block',
              }}
            >
              {post.publishDate}
            </p>
            <div
              dangerouslySetInnerHTML={{
                __html: post.body.childMarkdownRemark.html,
              }}
            />
            <div>
              {
                this.props.data.contentfulBlogPost.enableComments && (
                  <Comments
                    comments={this.state.comments}
                    sortComments={this.sortComments}
                    order={this.state.sorting}
                  />)
              }
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    contentfulBlogPost(slug: { eq: $slug }) {
      title
      publishDate(formatString: "MMMM Do, YYYY")
      heroImage {
        fluid(maxWidth: 1180, background: "rgb:000000") {
          ...GatsbyContentfulFluid_tracedSVG
        }
      }
      body {
        childMarkdownRemark {
          html
        }
      }
    }
  }
`
