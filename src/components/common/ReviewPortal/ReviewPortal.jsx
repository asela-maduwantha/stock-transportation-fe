import React from 'react';
import { Card, Avatar } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
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
      <h1 className='review-portal-title'>What Our Clients Say</h1>
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
        }}
        className='review-swiper'
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <Card className='review-card' bordered={false}>
              <Meta
                avatar={<Avatar src={review.photoUrl} size={64} />}
                title={<h3 className="review-name">{review.name}</h3>}
                description={
                  <>
                    <p className="review-title">{review.title}</p>
                    <p className="review-text">{review.reviewText}</p>
                  </>
                }
              />
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewPortal;