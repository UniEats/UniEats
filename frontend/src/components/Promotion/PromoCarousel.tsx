import { useRef, useState, useEffect } from "react";
import { NormalizedPromotion } from "@/models/Promotion";
import "./PromoCarousel.css";

type PromoCarouselProps = {
  promotions: NormalizedPromotion[];
};

export default function PromoCarousel({ promotions }: PromoCarouselProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayInterval = 4500;

  const next = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= promotions.length ? 0 : prev + 1
    );
  };

  const prev = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? promotions.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => next(), autoplayInterval);
    return () => clearInterval(timer);
  }, [promotions.length]);

  useEffect(() => {
    if (!sliderRef.current || !wrapperRef.current) return;

    const slider = sliderRef.current;
    const wrapper = wrapperRef.current;
    const cards = slider.children;

    if (!cards.length) return;

    const firstCard = cards[0] as HTMLElement;
    const cardWidth = firstCard.offsetWidth;
    const gap = 20;

    const fullCard = cardWidth + gap;

    const wrapperCenter = wrapper.offsetWidth / 2;

    const cardCenter = fullCard * currentIndex + cardWidth / 2;

    const translateX = wrapperCenter - cardCenter;

    slider.style.transform = `translateX(${translateX}px)`;
  }, [currentIndex]);

  const renderPromoDetails = (promo: NormalizedPromotion) => {
    let details = "";
    if (promo.type === "PERCENTAGE") {
      details = `Discount: ${promo.percentage}%`;
    } else if (promo.type === "BUYX_PAYY") {
      details = `You buy ${promo.buyQuantity} and pay for ${promo.payQuantity}`;
    } else if (promo.type === "THRESHOLD") {
      details = `Minimum spend: $${promo.threshold}, discount: $${promo.discountAmount}`;
    } else if (promo.type === "BUY_GIVE_FREE") {
      let bought = "";
      if (promo.product?.length) {
        bought = promo.product.map(p => p.name).join(", ");
      } else if (promo.combo?.length) {
        bought = promo.combo.map(c => c.name).join(", ");
      }
    
      let free = "";
      if (promo.freeProducts?.length) {
        free = promo.freeProducts.map(p => p.name).join(", ");
      } else if (promo.freeCombos?.length) {
        free = promo.freeCombos.map(c => c.name).join(", ");
      }
    
      details = `Buy ${promo.oneFreePerTrigger ? "one" : "trigger"} (${bought}), get free (${free})`;
    
      if (promo.oneFreePerTrigger) {
        details += " (one free per trigger)";
      }
    }
    return details;
  };

  return (
    <div className="promo-carousel-container">
      <div className="promo-carousel">
        <button className="promo-arrow left" onClick={prev}>
          ‹
        </button>

        <div className="promo-slider-wrapper" ref={wrapperRef}>
          <div className="promo-slider" ref={sliderRef}>
            {promotions.map((promo, i) => (
              <article
                className={`promo-card ${
                  i === currentIndex ? "active" : "inactive"
                }`}
                key={promo.id}
              >
                <h3>{promo.name}</h3>
                <p className="promo-description">{promo.description}</p>

                <p className="promo-type">{renderPromoDetails(promo)}</p>

                {promo.products && Object.keys(promo.products).length > 0 && (
                  <>
                    <p className="promo-subtitle">Applied products:</p>
                    <p className="promo-list">{Object.values(promo.products).join(", ")}</p>
                  </>
                )}

                {promo.combos && Object.keys(promo.combos).length > 0 && (
                  <>
                    <p className="promo-subtitle">Applied combos:</p>
                    <p className="promo-list">{Object.values(promo.combos).join(", ")}</p>
                  </>
                )}

                <p className="promo-days">
                  Valid: {promo.validDays.join(", ")}
                </p>
              </article>
            ))}
          </div>
        </div>

        <button className="promo-arrow right" onClick={next}>
          ›
        </button>
      </div>

      <div className="promo-dots">
        {promotions.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
