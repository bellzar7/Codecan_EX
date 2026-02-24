// Enums
enum EcommerceProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

enum EcommerceCategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

enum EcommerceReviewStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

enum EcommerceDiscountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// E-commerce Product
interface EcommerceProduct {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  categoryId: string;
  inventoryQuantity: number;
  filePath?: string;
  status: EcommerceProductStatus;
  image?: string;
  currency: string;
  walletType: WalletType;
  createdAt: Date;
  updatedAt: Date;
  // Relations:
  category: EcommerceCategory;
  reviews: EcommerceReview[];
  orderItems: EcommerceOrderItem[];
  discounts: EcommerceDiscount[];
  ecommerceWishlist: EcommerceWishlist[];
}

// E-commerce Category
interface EcommerceCategory {
  id: string;
  name: string;
  description: string;
  image?: string;
  status: EcommerceCategoryStatus;
  // Relation:
  products: EcommerceProduct[];
}

// E-commerce Order
interface EcommerceOrder {
  id: string;
  userId: string;
  status: EcommerceOrderStatus;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  orderItems: EcommerceOrderItem[];
}

enum EcommerceOrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

// E-commerce Order Item
interface EcommerceOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  key?: string;
  // Relations:
  order: EcommerceOrder;
  product: EcommerceProduct;
}

// E-commerce Review
interface EcommerceReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  status: EcommerceReviewStatus;
  // Relations:
  product: EcommerceProduct;
  user: User; // Assuming User is defined elsewhere in your code.
}

// E-commerce Discount
interface EcommerceDiscount {
  id: string;
  code: string;
  percentage: number;
  validUntil: Date;
  productId: string;
  status: EcommerceDiscountStatus;
  // Relation:
  product: EcommerceProduct;
}

// E-commerce Wishlist
interface EcommerceWishlist {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  // Relations:
  user: User; // Assuming User is defined elsewhere in your code.
  product: EcommerceProduct;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  type: string;
  price: number;
  categoryId: string;
  inventoryQuantity: number;
  status: boolean;
  image: string;
  currency: string;
  walletType: string;
  createdAt: string;
  rating: number;
  reviewsCount: number;
  ecommerceReviews: Review[];
  orders: Order[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: boolean;
  createdAt: string;
  products: Product[];
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  status: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

interface Order {
  id: string;
  userId: string;
  status: string;
  shippingId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  ecommerceOrderItem: {
    quantity: number;
    filePath: string | null;
    key: string | null;
  };
}
