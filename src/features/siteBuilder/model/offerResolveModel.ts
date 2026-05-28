export type ResolvedOffer = {
  offer_code: string;
  title: string;
  category: string;
  description: string;
  price_cents: number;
  currency: string;
  display_price: string;
  image_url: string | null;
  status: string;
  stock_status: string;
};

export type OfferResolveResponse = {
  offer: ResolvedOffer;
};
