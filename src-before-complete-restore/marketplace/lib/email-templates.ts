/**
 * Email Templates for Marketplace
 * HTML email templates for various notifications
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  /**
   * Order confirmation for buyers
   */
  orderConfirmation: (data: any): EmailTemplate => ({
    subject: `Order Confirmed #${data.order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .order-details { background: #f5f5f5; padding: 20px; margin: 20px 0; }
          .item { border-bottom: 1px solid #ddd; padding: 10px 0; }
          .total { font-size: 20px; font-weight: bold; color: #10b981; }
          .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          
          <p>Hi ${data.order.buyer.name},</p>
          <p>Thank you for your order! Your fresh produce will be ${data.order.deliveryMethod === 'delivery' ? 'delivered' : 'ready for pickup'} on:</p>
          
          <p style="font-size: 18px; font-weight: bold;">
            ${new Date(data.order.deliveryDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            ${data.order.items.map((item: any) => `
              <div class="item">
                <strong>${item.productName}</strong><br>
                ${item.quantity} ${item.unit} @ $${item.pricePerUnit}/${item.unit}
                <span style="float: right;">$${item.totalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; text-align: right;">
              <div class="total">Total: $${data.order.totalAmount.toFixed(2)}</div>
            </div>
          </div>
          
          ${data.order.deliveryMethod === 'delivery' ? `
            <p><strong>Delivery Address:</strong><br>
            ${data.order.deliveryAddress}</p>
          ` : `
            <p><strong>Pickup Location:</strong><br>
            ${data.sellerAddress}</p>
          `}
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/orders/${data.order.id}" class="button">
            View Order Details
          </a>
          
          <p>Questions? Contact the seller directly or reply to this email.</p>
          
          <p>Fresh regards,<br>
          The VibeLux Marketplace Team</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Order Confirmed #${data.order.id}
      
      Thank you for your order! Your fresh produce will be ${data.order.deliveryMethod === 'delivery' ? 'delivered' : 'ready for pickup'} on ${new Date(data.order.deliveryDate).toLocaleDateString()}.
      
      Order Total: $${data.order.totalAmount.toFixed(2)}
      
      View order details: ${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/orders/${data.order.id}
    `
  }),

  /**
   * New order notification for sellers
   */
  newOrder: (data: any): EmailTemplate => ({
    subject: `New Order Received! #${data.order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
          .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .button { background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received!</h1>
          </div>
          
          <div class="alert">
            <strong>Action Required:</strong> Please confirm this order within 24 hours
          </div>
          
          <p>Hi ${data.order.seller.name},</p>
          <p>Great news! You have a new order from ${data.order.buyer.name}.</p>
          
          <h3>Order Summary</h3>
          <ul>
            ${data.order.items.map((item: any) => `
              <li>${item.quantity} ${item.unit} of ${item.productName}</li>
            `).join('')}
          </ul>
          
          <p><strong>Total Value:</strong> $${data.order.totalAmount.toFixed(2)}</p>
          <p><strong>Your Payout:</strong> $${(data.order.totalAmount * 0.95).toFixed(2)} (after 5% marketplace fee)</p>
          
          <p><strong>${data.order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} Date:</strong> 
          ${new Date(data.order.deliveryDate).toLocaleDateString()}</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/orders/${data.order.id}" class="button">
            Confirm Order
          </a>
          
          <p>Remember to update your inventory after confirming!</p>
          
          <p>Happy selling,<br>
          The VibeLux Marketplace Team</p>
        </div>
      </body>
      </html>
    `,
    text: `
      New Order Received! #${data.order.id}
      
      You have a new order from ${data.order.buyer.name}.
      Total Value: $${data.order.totalAmount.toFixed(2)}
      Your Payout: $${(data.order.totalAmount * 0.95).toFixed(2)}
      
      Please confirm within 24 hours: ${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/orders/${data.order.id}
    `
  }),

  /**
   * Order status update
   */
  orderStatusUpdate: (data: any): EmailTemplate => {
    const statusMessages: Record<string, string> = {
      CONFIRMED: 'Your order has been confirmed by the seller!',
      IN_TRANSIT: 'Your order is on the way!',
      DELIVERED: 'Your order has been delivered!',
      CANCELLED: 'Your order has been cancelled.',
      REFUNDED: 'Your order has been refunded.'
    };

    return {
      subject: `Order Update: ${statusMessages[data.status]} #${data.order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .status-badge { 
              display: inline-block; 
              padding: 8px 16px; 
              background: ${data.status === 'DELIVERED' ? '#10b981' : '#3b82f6'}; 
              color: white; 
              border-radius: 20px; 
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Order Update</h1>
            <p>Hi ${data.order.buyer.name},</p>
            
            <p>${statusMessages[data.status]}</p>
            
            <p>Order #${data.order.id} is now: <span class="status-badge">${data.status}</span></p>
            
            ${data.status === 'IN_TRANSIT' ? `
              <p>Expected delivery: ${new Date(data.order.deliveryDate).toLocaleDateString()}</p>
              <p>Track your delivery in the app for real-time updates.</p>
            ` : ''}
            
            ${data.status === 'DELIVERED' ? `
              <p>We hope you enjoy your fresh produce!</p>
              <p>Please take a moment to rate your experience and help other buyers.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/orders/${data.order.id}/rate" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 20px 0;">
                Rate Your Order
              </a>
            ` : ''}
            
            <p>View full order details: ${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/orders/${data.order.id}</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Update: ${statusMessages[data.status]}
        Order #${data.order.id} is now: ${data.status}
        
        View details: ${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/orders/${data.order.id}
      `
    };
  },

  /**
   * Welcome email for new marketplace users
   */
  marketplaceWelcome: (data: any): EmailTemplate => ({
    subject: 'Welcome to VibeLux Marketplace! 🌱',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
          .feature { padding: 20px; margin: 10px 0; background: #f5f5f5; border-radius: 8px; }
          .cta { background: #10b981; color: white; padding: 16px 32px; text-decoration: none; display: inline-block; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to the Future of Fresh! 🚀</h1>
          </div>
          
          <p>Hi ${data.user.name},</p>
          <p>Welcome to VibeLux Marketplace - where cutting-edge CEA technology meets farm-fresh produce!</p>
          
          ${data.user.type === 'grower' ? `
            <h2>Start Selling in 3 Easy Steps:</h2>
            
            <div class="feature">
              <h3>1. Create Your First Listing 📝</h3>
              <p>Add photos, set prices, and showcase your certifications</p>
            </div>
            
            <div class="feature">
              <h3>2. Connect with Buyers 🤝</h3>
              <p>Local restaurants and retailers are looking for quality produce like yours</p>
            </div>
            
            <div class="feature">
              <h3>3. Grow Your Business 📈</h3>
              <p>Track sales, manage inventory, and build lasting relationships</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/create-listing" class="cta">
              Create Your First Listing
            </a>
            
            <p><strong>🎉 Special Offer:</strong> Your first 3 months are commission-free!</p>
          ` : `
            <h2>Discover Fresh, Local Produce:</h2>
            
            <div class="feature">
              <h3>🥬 Browse Fresh Inventory</h3>
              <p>Updated daily from local CEA growers</p>
            </div>
            
            <div class="feature">
              <h3>🏆 Verified Quality</h3>
              <p>All growers are verified with transparent certifications</p>
            </div>
            
            <div class="feature">
              <h3>🚚 Flexible Delivery</h3>
              <p>Schedule delivery or pickup at your convenience</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce-board" class="cta">
              Start Shopping
            </a>
            
            <p><strong>🎁 Welcome Gift:</strong> Use code FRESH10 for $10 off your first order!</p>
          `}
          
          <p>Need help getting started? Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace/help">quick start guide</a>.</p>
          
          <p>Fresh regards,<br>
          The VibeLux Team</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to VibeLux Marketplace!
      
      Start ${data.user.type === 'grower' ? 'selling' : 'shopping'} today: ${process.env.NEXT_PUBLIC_APP_URL}/marketplace
      
      ${data.user.type === 'grower' ? 'Your first 3 months are commission-free!' : 'Use code FRESH10 for $10 off!'}
    `
  }),

  /**
   * Low inventory alert for growers
   */
  lowInventoryAlert: (data: any): EmailTemplate => ({
    subject: `Low Inventory Alert: ${data.product}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .alert-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Low Inventory Alert 📉</h1>
          
          <div class="alert-box">
            <h3>${data.product}</h3>
            <p>Current Stock: <strong>${data.currentStock} ${data.unit}</strong></p>
            <p>This is below your minimum threshold of ${data.threshold} ${data.unit}</p>
          </div>
          
          <p>Recent sales velocity: ${data.dailyAverage} ${data.unit}/day</p>
          <p>Estimated stockout in: <strong>${data.daysUntilStockout} days</strong></p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/inventory" 
             style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; display: inline-block;">
            Update Inventory
          </a>
        </div>
      </body>
      </html>
    `,
    text: `
      Low Inventory Alert: ${data.product}
      Current Stock: ${data.currentStock} ${data.unit}
      Estimated stockout in: ${data.daysUntilStockout} days
      
      Update inventory: ${process.env.NEXT_PUBLIC_APP_URL}/marketplace/produce/inventory
    `
  })
};