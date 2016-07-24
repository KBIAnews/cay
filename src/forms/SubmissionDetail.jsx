import React, { Component } from 'react';
import Radium from 'radium';
import moment from 'moment';
import BBookmark from 'react-icons/lib/fa/bookmark';
import PaperPlaneIcon from 'react-icons/lib/fa/paper-plane';
import FlagIcon from 'react-icons/lib/fa/flag';
import TrashIcon from 'react-icons/lib/fa/trash';

import settings from 'settings';
import Button from 'components/Button';
import { hasFlag } from 'forms/FormActions';

@Radium
export default class SubmissionDetail extends Component {
  render() {
    const { submission } = this.props;

    if(!submission) {
      return (<h1 style={styles.container}>No submissions</h1>);
    }

    return (
      <div style={styles.container}>
        {this.renderAuthorDetail()}
        {this.renderAnswers()}
      </div>
    );
  }

  renderAnswers() {
    const { submission, gallery } = this.props;

    if (!submission) {
      return (<p>loading submission...</p>);
    }

    if (!gallery) {
      return (<p>Loading gallery...</p>);
    }

    return (
      <div style={styles.answersContainer}>
        {submission.replies.map((reply, key) => {

          // identity fields are shown above, not as part of
          //   the reply list
          if (reply.identity === true) {
            return (<span></span>);
          }


          // determine whether or not the answers is already
          //  in the gallery
          //  we need to find if BOTH
          //   this submission id matches
          //   and the answer has come form the widget
          const inGallery = gallery.answers.some(ans => {
            return ans.answer_id === reply.widget_id && ans.submission_id === submission.id;
          });

          const modAnswer = inGallery ? this.props.removeFromGallery : this.props.sendToGallery;
          return (
            <div style={styles.answer} key={key}>
              <h2 style={styles.question}>{reply.question}</h2>
              {this.renderAnswer(reply)}
              {/*<p>galleryId: {gallery ? gallery.id : 'loading gallery'}</p>
              <p>submissionId: {submission.id}</p>
              <p>widget id: {reply.widget_id}</p>*/}
              <Button
                style={styles.galleryButton}
                category={inGallery ? 'success' : 'default'}
                onClick={modAnswer.bind(this, gallery.id, submission.id, reply.widget_id)}>
                {
                  inGallery ?
                    <span>Remove from Gallery <TrashIcon /></span> :
                    <span>Send to gallery <PaperPlaneIcon /></span>
                }
              </Button>

            </div>
          );
        })}
      </div>
    );
  }

  renderAnswer(reply) {
    if (reply.answer === null) {
      return (<span>No response</span>);
    }

    if (reply.answer.options) {

      const selectedIndexes = reply.answer.options.map(o => o.index);

      return (
        <ul>
          {reply.props.options.map((option, key) => {
            const selected = selectedIndexes.indexOf(key) !== -1;

            return <li
              style={[styles.multiple, selected && styles.multiple.selected]}
              key={key}>{key + 1}. {option.title}</li>;
          })}
        </ul>
      );
    }

    if ('text' in reply.answer) {
      return reply.answer.text;
    }

    return '';
  }

  renderAuthorDetail() {
    const { submission, submissionId, onFlag, onBookmark } = this.props;
    const authorDetails = submission.replies
      .filter(({ identity }) => identity === true)
      .map(reply => ({
        label: reply.question,
        answer: this.renderAnswer(reply)
      }));

    const [flagged, bookmarked] = [hasFlag(submission, 'flagged'), hasFlag(submission, 'bookmarked')];
    return (
      <div>
        <div style={styles.authorHeaderContainer}>
          <div style={styles.authorHeaderInfo}>
            <span style={styles.subNum}>{submissionId}</span> {moment(submission.date_created).format('L LT')}
          </div>
          <div style={styles.headerButtons}>
            <Button
              style={styles.headerButton}
              onClick={() => onFlag(!flagged)}
              category={flagged ? 'danger' : ''}>
                Flag{flagged ? 'ged' : ''} <FlagIcon style={styles.headerButtonIcon(flagged, 'rgb(217, 83, 79)')} />
              </Button>
            <Button
              style={styles.headerButton}
              onClick={() => onBookmark(!bookmarked)}
              category={bookmarked ? 'success' : ''}>
              Bookmark{bookmarked ? 'ed' : ''} <BBookmark  style={styles.headerButtonIcon(bookmarked, 'rgb(46, 151, 102)')} />
            </Button>
          </div>
        </div>
        <div style={styles.submissionContainer}>
          <div style={styles.authorContainer}>
            <div style={styles.authorDetailsContainer}>
              <div style={styles.authorDetailsColumn}>
                { authorDetails.map(detail => {
                  return (
                    <p style={styles.identity}><span style={styles.identity.label}>{detail.label}</span> {detail.answer}</p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  identity: {
    fontSize: '16px',
    marginBottom: 10,
    label: {
      fontWeight: 'bold'
    }
  },
  galleryButton: {
    float: 'right',
    marginTop: 10,
    marginBottom: 20
  },
  answersContainer: {
    padding: '0 50px 50px 50px'
  },
  question: {
    fontWeight: 'bold',
    fontSize: '1.2em',
    marginBottom: 10
  },
  answer: {
    clear: 'both'
  },
  authorHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  authorDetailsContainer: {
    display: 'flex',
    paddingTop: 10
  },
  authorDetailsColumn: {
    flex: 1
  },
  container: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    margin: '0 30px 30px 30px'
  },
  submissionContainer: {
    padding: 50
  },
  headerContainer: {
    display: 'inline-block',
    position: 'relative'
  },
  headerButtons: {
  },
  headerButton: {
    marginLeft: 10
  },
  headerButtonIcon(show, color) {
    return {
      color: !show ? color : '#fff'
    };
  },
  authorHeaderInfo: {
    flex: 1,
    paddingBottom: 15,
    borderBottom: '1px solid ' + settings.mediumGrey,
    marginRight: 20
  },
  subNum: {
    fontSize: '1.2em',
    marginRight: 10,
    fontWeight: 'bold'
  },
  multiple: {
    border: '1px solid ' + settings.mediumGrey,
    padding: 10,
    display: 'inline-block',
    width: '48%',
    marginRight: '1%',
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    selected: {
      backgroundColor: settings.darkerGrey,
      color: 'white'
    }
  }
};
