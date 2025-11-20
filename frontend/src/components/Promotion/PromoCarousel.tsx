import { useEffect, useRef, useState } from "react";

import { NormalizedPromotion } from "@/models/Promotion";

import "./PromoCarousel.css";

type PromoCarouselProps = {
  promotions: NormalizedPromotion[];
};

export default function PromoCarousel({ promotions }: PromoCarouselProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayInterval = 5000;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1 >= promotions.length ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? promotions.length - 1 : prev - 1));
  };

  const [paused] = useState(false);

  useEffect(() => {
    if (paused || promotions.length <= 1) return;
    const timer = setTimeout(() => next(), autoplayInterval);
    return () => clearTimeout(timer);
  }, [currentIndex, paused, promotions.length]);

  useEffect(() => {
    if (!sliderRef.current || !wrapperRef.current) return;

    const slider = sliderRef.current;
    const wrapper = wrapperRef.current;
    const cards = slider.children;

    if (!cards.length) return;

    const activeCard = cards[currentIndex] as HTMLElement;
    const cardWidth = activeCard.offsetWidth;

    const cardLeft = activeCard.offsetLeft;
    const wrapperCenter = wrapper.offsetWidth / 2;
    const cardCenter = cardLeft + cardWidth / 2;

    const translateX = wrapperCenter - cardCenter;

    slider.style.transform = `translateX(${translateX}px)`;
  }, [currentIndex, promotions.length]);

  const renderPromoDetails = (promo: NormalizedPromotion) => {
    if (promo.type === "PERCENTAGE") {
      return `Get ${promo.percentage}% OFF your order!`;
    }
    if (promo.type === "BUYX_PAYY") {
      return `Buy ${promo.buyQuantity}, Pay for ${promo.payQuantity}!`;
    }
    if (promo.type === "THRESHOLD") {
      return `Save $${promo.discountAmount} on orders over $${promo.threshold}`;
    }
    if (promo.type === "BUY_GIVE_FREE") {
      return "Buy specific items, get one free!";
    }
    return "Special Offer";
  };

  if (!promotions || promotions.length === 0) return null;
  
  return (
    <div className="promo-carousel-container">
      <div className="promo-carousel">
        {promotions.length > 1 && (
          <button className="promo-arrow left" onClick={prev}>
            ‹
          </button>
        )}

        <div className="promo-slider-wrapper" ref={wrapperRef}>
          <div className="promo-slider" ref={sliderRef}>
            {promotions.map((promo, i) => (
              <article
                className={`promo-card ${i === currentIndex ? "active" : "inactive"}`}
                key={promo.id}
                onClick={() => setCurrentIndex(i)}
              >
                <span className="promo-type">{promo.name}</span>

                <h3>{renderPromoDetails(promo)}</h3>

                <p className="promo-description">{promo.description}</p>

                <div className="promo-details-container">
                  {promo.products && Object.keys(promo.products).length > 0 && (
                    <small>
                      <strong>Includes:</strong> {Object.values(promo.products).join(", ")}
                    </small>
                  )}
                  {promo.combos && Object.keys(promo.combos).length > 0 && (
                    <small>
                      <strong>Combos:</strong> {Object.values(promo.combos).join(", ")}
                    </small>
                  )}
                </div>

                <p className="promo-days">Available: {promo.validDays.map((d) => d.substring(0, 3)).join(", ")}</p>
              </article>
            ))}
          </div>
        </div>

        {promotions.length > 1 && (
          <button className="promo-arrow right" onClick={next}>
            ›
          </button>
        )}
      </div>

      {promotions.length > 1 && (
        <div className="promo-dots">
          {promotions.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to promotion ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
