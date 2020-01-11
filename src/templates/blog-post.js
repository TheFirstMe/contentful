import React from 'react'
import { graphql } from 'gatsby'
import Helmet from 'react-helmet'
import get from 'lodash/get'
import Img from 'gatsby-image'
import Layout from '../components/layout'

import heroStyles from '../components/hero.module.css'
import styles from "./blog-post.module.css"

const axios = require('axios');

const Comments = props => {
  const order = props.order === true ? "Oldest First" : "Most Recent"
  return (
    <>
      <div className={styles.details}>
        {props.comments && <span>{props.comments.length} Comments</span>}
        <button onClick={props.sortComments}>{order}</button>
      </div>
      {props.comments &&
        props.comments.map(comment => (
          <div className={styles.commentContainer} key={comment.id}>
            <div className={styles.comment}>
              <div className={styles.commentDetails}>
                <span className={styles.commentDetailsName}>
                  <a href={comment.handle}>{comment.name}</a>
                </span>
                <span className={styles.commentDetailsDate}>
                  {comment.timestamp}
                </span>
              </div>
              <p>{comment.message}</p>
              <button
                className={styles.commentReplyBtn}
                onClick={() => props.reply(comment.id, comment.name)}
              >
                Reply
              </button>
            </div>
            <div className={styles.replies}>
              {comment.replies.map((comment, index) => (
                <div className={styles.commentReply} key={index}>
                  <div className={styles.commentDetails}>
                    <span lassName={styles.commentDetailsName}>
                      <a href={comment.handle}>{comment.name}</a>
                    </span>
                    <span className={styles.commentDetailsDate}>
                      {comment.timestamp}
                    </span>
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
  constructor(props) {
    super(props)
    this.state = {
      comments: [],
    }
  }
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

  reply = (id, name) => {
    window.scrollTo(50, document.body.scrollHeight)
    this.setState({
      reply: true,
      replyName: `Replying to ${name} `,
      replyID: id
    })
  }

  canceReply = evt => {
    evt.preventDefault()
    this.setState({
      reply: false,
      replyName: ``,
      replyID: null
    })
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
              {console.log(post.enableComments)}
              {
                post.enableComments && (
                  <Comments
                    comments={this.state.comments}
                    reply={this.reply}
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
      enableComments
      body {
        childMarkdownRemark {
          html
        }
      }
      contentful_id
    }
  }
`
