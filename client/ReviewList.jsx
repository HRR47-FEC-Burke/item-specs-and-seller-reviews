import React from 'react';
import $ from 'jquery';
import styled from 'styled-components';

const StyledDiv = styled.div`
  && {
    font-family: sans-serif;
    font-style: oblique;
  }
`;

const StyledToggle = styled.div`
  text-decoration: underline;
  color: blue;
`;

class ReviewList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentItem: {},
      reviews: [],
      rating: 0,
      isShowingReviews: false
    };
    this.toggleReadMore = this.toggleReadMore.bind(this);
    this.handleSpacebar = this.handleSpacebar.bind(this);
    this.getRenderedReviews = this.getRenderedReviews.bind(this);
    this.assignReviewNames = this.assignReviewNames.bind(this);
  }

  componentDidMount() {
    const endpoint = window.location.href.split('/')[4];
    $.get(`/api/item/${endpoint}`, (data) => {
      const currentItem = data;
      this.setState({
        currentItem
      });
      $.get(`/api/item/${currentItem._id}/reviews`, (data) => {
        let averageRating = 0;
        if (data.length !== 0) {
          for (let i = 0; i < data.length; i += 1) {
            averageRating += data[i].rating;
          }
          this.setState({
            rating: averageRating / data.length
          });
        } else {
          this.setState({
            rating: 0
          });
        }
        this.assignReviewNames(data);
      });
    });
  }

  getRenderedReviews() {
    const { reviews, isShowingReviews } = this.state;
    if (isShowingReviews && reviews.length > 0) {
      return reviews.slice(0, 5);
    }
    return [];
  }

  assignReviewNames(input, index = 0) {
    if (index === input.length || index === 5) {
      this.setState({
        reviews: input
      });
    } else {
      const currentId = input[index].listing_id;
      $.get(`/api/item/${currentId}`, (data) => {
        const temp = input;
        temp[index].listingName = data.name;
        this.assignReviewNames(temp, index + 1);
      });
    }
  }

  handleSpacebar(e) {
    if (e.keyCode === 32) {
      this.toggleReadMore();
    }
  }

  toggleReadMore() {
    const { isShowingReviews } = this.state;
    if (isShowingReviews === true) {
      this.setState({
        isShowingReviews: false
      });
    } else {
      this.setState({
        isShowingReviews: true
      });
    }
  }

  render() {
    const { currentItem, reviews, rating } = this.state;
    return (
      <StyledDiv>
        <div>{currentItem.name}</div>
        <StyledToggle
          role="link"
          tabIndex="0"
          onClick={this.toggleReadMore}
          onKeyDown={this.handleSpacebar}
        >
          <span>
            Seller Reviews:
            {rating.toFixed(2)}
            /5 (
            {reviews.length}
            )
          </span>
        </StyledToggle>
        <div>
          {this.getRenderedReviews().map((review) => (
            <div>
              <div>
                <span>
                  {review.rating}
                  /5
                </span>
              </div>
              <div>{review.listingName}</div>
              <div>
                <span>
                  {review.author}
                  {' '}
                  -
                  {review.date.slice(0, 10)}
                </span>
              </div>
              <p>{review.description}</p>
            </div>
          ))}
        </div>
      </StyledDiv>
    );
  }
}

export default ReviewList;
