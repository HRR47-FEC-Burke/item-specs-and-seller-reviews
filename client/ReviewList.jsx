import React from 'react';
import $ from 'jquery';
import styled from 'styled-components';
import RatingDisplay from './RatingDisplay.jsx';
import StyledArrow from './StyledArrow.jsx';

const StyledDiv = styled.div`
  && {
    position: relative;
    border: 1px solid #ddd;
    box-shadow: 2px 2px 1px #f9f9f9;
    width: 700px;
    float: left;
    margin-left: 80px;
    margin-right: 1em;
    margin-bottom: 1em;
    padding-top: 5px;
    padding-bottom: 6px;
    font-family: "Arial", "Verdana", sans-serif;
    font-size: 14px;
  }
`;

const StyledToggle = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
  font-size: 18px;
`;

const SellerReviewsText = styled.span`
  margin-right: 15px;
  color: #414141;
`;

const StyledReview = styled.div`
  border-top: 1px solid #ddd;
  padding-top: 10px;
  margin-top: 20px;
  margin-left: 10px;
  margin-right: 10px;
  color: #414141;
`;

const ReviewAuthor = styled.div`
  font-size: 11px;
  color: silver;
`;

const NameListing = styled.a`
  color: blue;
  font-weight: bold;
  font-size: 15px;
  text-decoration: none;
  &:hover {
    color: orange;
  }
`;

const ReviewCount = styled.span`
  color: silver;
  font-size: 14px;
`;

class ReviewList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reviews: [],
      rating: 0,
      isShowingReviews: false
    };
    this.toggleReadMore = this.toggleReadMore.bind(this);
    this.handleSpacebar = this.handleSpacebar.bind(this);
    this.handleStateFetch = this.handleStateFetch.bind(this);
    this.getRenderedReviews = this.getRenderedReviews.bind(this);
    this.assignReviewNames = this.assignReviewNames.bind(this);
  }

  componentDidMount() {
    const endpoint = window.location.href.split('/')[4];
    $.get(`/api/item/${endpoint}`, (data) => {
      const currentItem = data;
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

  handleStateFetch(callback) {
    const { rating } = this.state;
    callback(rating);
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
    const { reviews, rating, isShowingReviews } = this.state;
    return (
      <StyledDiv>
        <StyledToggle
          role="link"
          tabIndex="0"
          onClick={this.toggleReadMore}
          onKeyDown={this.handleSpacebar}
        >
          <span>
            <SellerReviewsText>
              Seller Reviews
            </SellerReviewsText>
            {' '}
            <RatingDisplay rating={rating.toFixed(2)} />
            {' '}
            <ReviewCount>
              (
              {reviews.length}
              )
            </ReviewCount>
            <StyledArrow isShowingReviews={isShowingReviews} />
          </span>
        </StyledToggle>
        <div>
          {this.getRenderedReviews().map((review) => (
            <StyledReview>
              <div>
                <span>
                  <RatingDisplay rating={review.rating} />
                </span>
              </div>
              <NameListing
                href={`http://localhost:2625/item/${review.listing_id}/`}
              >
                {review.listingName}
              </NameListing>
              <div>
                <span>
                  <ReviewAuthor>
                    {review.author}
                    {' '}
                    -
                    {' '}
                    {review.date.slice(0, 10)}
                  </ReviewAuthor>
                </span>
              </div>
              <p>{review.description}</p>
            </StyledReview>
          ))}
        </div>
      </StyledDiv>
    );
  }
}

export default ReviewList;
