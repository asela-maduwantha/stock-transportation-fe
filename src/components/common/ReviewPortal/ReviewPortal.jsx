import React, { useState, useEffect } from 'react';
import { Card, Avatar } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './ReviewPortal.css';
import httpService from '../../../services/httpService';

const { Meta } = Card;

const ReviewPortal = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await httpService.get('/common/feedbacks', {
          headers: { 'Accept': 'application/json' }
        });
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, []);

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
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <Card className='review-card' bordered={false}>
              <Meta
                avatar={<Avatar src={`/api/placeholder/64/64`} size={64} />}
                title={<h3 className="review-name">{review.customerName}</h3>}
                description={
                  <>
                    <p className="review-text">{review.feedback}</p>
                    <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
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