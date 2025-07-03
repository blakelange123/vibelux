import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { withMarketplaceSecurity, MarketplaceSecurityMiddleware } from '@/middleware/marketplace-security';

const prisma = new PrismaClient();

// Input validation schema
function validateCartInput(data: any) {
  const errors = [];
  
  if (!data.productId || typeof data.productId !== 'string') {
    errors.push('Invalid product ID');
  }
  
  if (!data.quantity || typeof data.quantity !== 'number' || data.quantity <= 0 || data.quantity > 1000) {
    errors.push('Invalid quantity (must be 1-1000)');
  }
  
  if (!data.price || typeof data.price !== 'number' || data.price <= 0 || data.price > 1000000) {
    errors.push('Invalid price (must be positive and reasonable)');
  }
  
  return errors;
}

export async function GET(request: NextRequest) {
  return withMarketplaceSecurity(async (request: NextRequest, { userId }: { userId: string }) => {
    try {
      // Fetch user's cart items from database
      const cartItems = await prisma.marketplaceCartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              vendor: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return NextResponse.json({
        success: true,
        cart: {
          items: cartItems,
          total,
          itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Cart GET error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      );
    }
  })(request);
}

export async function POST(request: NextRequest) {
  return withMarketplaceSecurity(async (request: NextRequest, { userId }: { userId: string }) => {
    try {
      const body = await request.json();
      
      // Sanitize input
      const sanitizedBody = MarketplaceSecurityMiddleware.sanitizeInput(body);
      const validationErrors = validateCartInput(sanitizedBody);
      
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationErrors },
          { status: 400 }
        );
      }
      
      const { productId, quantity, price } = sanitizedBody;

      // Verify product exists and is available
      const product = await prisma.marketplaceProduct.findUnique({
        where: { id: productId },
        include: { vendor: true }
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      if (product.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Product is not available' },
          { status: 400 }
        );
      }

      // Check if user is trying to buy their own product
      if (product.userId === userId) {
        return NextResponse.json(
          { error: 'Cannot add your own product to cart' },
          { status: 400 }
        );
      }

      // Check stock availability
      if (product.stockQuantity < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Only ${product.stockQuantity} available` },
          { status: 400 }
        );
      }

      // Use upsert to handle existing items
      const cartItem = await prisma.marketplaceCartItem.upsert({
        where: {
          userId_productId: {
            userId,
            productId
          }
        },
        update: {
          quantity: {
            increment: quantity
          },
          price: product.listPrice, // Update to current price
          updatedAt: new Date()
        },
        create: {
          userId,
          productId,
          quantity,
          price: product.listPrice
        },
        include: {
          product: {
            include: {
              vendor: true
            }
          }
        }
      });

      // Get updated cart total
      const cartItems = await prisma.marketplaceCartItem.findMany({
        where: { userId }
      });
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return NextResponse.json({
        success: true,
        cartItem,
        cartTotal: total,
        message: 'Item added to cart'
      });
    } catch (error) {
      console.error('Cart POST error:', error);
      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      );
    }
  })(request);
}

export async function PUT(request: NextRequest) {
  return withMarketplaceSecurity(async (request: NextRequest, { userId }: { userId: string }) => {
    try {
      const body = await request.json();
      const sanitizedBody = MarketplaceSecurityMiddleware.sanitizeInput(body);
      
      if (!sanitizedBody.productId || typeof sanitizedBody.productId !== 'string') {
        return NextResponse.json(
          { error: 'Invalid product ID' },
          { status: 400 }
        );
      }
      
      if (sanitizedBody.quantity === undefined || typeof sanitizedBody.quantity !== 'number' || sanitizedBody.quantity < 0 || sanitizedBody.quantity > 1000) {
        return NextResponse.json(
          { error: 'Invalid quantity (must be 0-1000)' },
          { status: 400 }
        );
      }
      
      const { productId, quantity } = sanitizedBody;

      if (quantity === 0) {
        // Remove item from cart
        await prisma.marketplaceCartItem.delete({
          where: {
            userId_productId: {
              userId,
              productId
            }
          }
        });
      } else {
        // Check stock availability
        const product = await prisma.marketplaceProduct.findUnique({
          where: { id: productId }
        });

        if (!product) {
          return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
          );
        }

        if (product.stockQuantity < quantity) {
          return NextResponse.json(
            { error: `Insufficient stock. Only ${product.stockQuantity} available` },
            { status: 400 }
          );
        }

        // Update quantity
        await prisma.marketplaceCartItem.update({
          where: {
            userId_productId: {
              userId,
              productId
            }
          },
          data: {
            quantity,
            updatedAt: new Date()
          }
        });
      }

      // Get updated cart
      const cartItems = await prisma.marketplaceCartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              vendor: true
            }
          }
        }
      });

      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return NextResponse.json({
        success: true,
        cart: {
          items: cartItems,
          total,
          itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        },
        message: 'Cart updated'
      });
    } catch (error) {
      console.error('Cart PUT error:', error);
      return NextResponse.json(
        { error: 'Failed to update cart' },
        { status: 500 }
      );
    }
  })(request);
}

export async function DELETE(request: NextRequest) {
  return withMarketplaceSecurity(async (request: NextRequest, { userId }: { userId: string }) => {
    try {
      const { searchParams } = new URL(request.url);
      const productId = searchParams.get('productId');

      if (productId) {
        // Remove specific item
        await prisma.marketplaceCartItem.delete({
          where: {
            userId_productId: {
              userId,
              productId
            }
          }
        });
      } else {
        // Clear entire cart
        await prisma.marketplaceCartItem.deleteMany({
          where: { userId }
        });
      }

      // Get updated cart
      const cartItems = await prisma.marketplaceCartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              vendor: true
            }
          }
        }
      });

      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return NextResponse.json({
        success: true,
        cart: {
          items: cartItems,
          total,
          itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        },
        message: productId ? 'Item removed from cart' : 'Cart cleared'
      });
    } catch (error) {
      console.error('Cart DELETE error:', error);
      return NextResponse.json(
        { error: 'Failed to remove item from cart' },
        { status: 500 }
      );
    }
  })(request);
}