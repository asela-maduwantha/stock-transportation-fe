import React from 'react';
import { Card, Avatar, Carousel } from 'antd';
import './ReviewPortal.css'; 
import ManImg from '../../../assets/images/man.jpg';

const { Meta } = Card;

const ReviewPortal = () => {
  const reviews = [
    {
      name: 'Michael Thompson',
      title: 'Marketing Manager, Axme Inc.',
      photoUrl: ManImg,
      reviewText: "The results we've achieved using this platform's marketing services are exceptional. Our campaigns are more effective, and the team's insights are invaluable.",
    },
    {
      name: 'Chris Doe',
      title: 'CEO at XYZ',
      photoUrl: ManImg,
      reviewText: 'A Computer Science graduate who likes to make things simpler. When he\'s not working, you can find him surfing the web, learning facts, tricks and life hacks. He also enjoys movies in his leisure time.',
    },
    {
      name: 'John Doe',
      title: 'CEO at ABC Company',
      photoUrl: ManImg,
      reviewText: "The results we've achieved using this platform's marketing services are exceptional. Our campaigns are more effective, and the team's insights are invaluable.",
    },
    {
      name: 'Jane Roe',
      title: 'CTO at DEF Inc.',
      photoUrl: ManImg,
      reviewText: "Fantastic platform! The insights we gained have transformed our business strategy.",
    },
    {
      name: 'Alex Smith',
      title: 'CMO at GHI Ltd.',
      photoUrl: ManImg,
      reviewText: "We've seen a significant improvement in our marketing efficiency. Highly recommend!",
    },
    {
      name: 'Linda Brown',
      title: 'Product Manager at JKL Corp.',
      photoUrl: ManImg,
      reviewText: "The analytics provided are top-notch. Our team is now better equipped to make informed decisions.",
    },
  ];

  return (
    <div className='review-portal-container'>
      <h1 className='review-portal-title'>Reviews</h1>
      <Carousel
  autoplay
  dots={true}
  className='review-carousel'
  slidesToShow={3}
  slidesToScroll={1}
  responsive={[
    { breakpoint: 768, settings: { slidesToShow: 1 } },
    { breakpoint: 1024, settings: { slidesToShow: 2 } }
  ]}
>

        {reviews.map((review, index) => (
          <div key={index} className='carousel-item'>
            <Card className='review-card' bordered={false}>
              <Meta
                avatar={<Avatar src={review.photoUrl} size={64} shape="circle" />}
                title={review.name}
                description={(
                  <>
                    <p>{review.title}</p>
                    <p className="review-text">{review.reviewText}</p>
                  </>
                )}
              />
            </Card>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ReviewPortal;
