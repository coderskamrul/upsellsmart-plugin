/**
 * Frontend JavaScript for UpsellSmart Product Recommendations
 * 
 * This file handles the frontend functionality for the WooCommerce product recommendations
 * including AJAX calls, UI interactions, and recommendation displays.
 */

// Import styles
import './styles/frontend.scss';

// Frontend functionality
class UpsellSmartFrontend {
    constructor() {
        this.init();
    }

    init() {
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.loadRecommendations();
            });
        } else {
            this.setupEventListeners();
            this.loadRecommendations();
        }
    }

    setupEventListeners() {
        // Handle recommendation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.upspr-recommendation-item')) {
                this.trackRecommendationClick(e.target);
            }
        });

        // Handle add to cart from recommendations
        document.addEventListener('click', (e) => {
            if (e.target.matches('.upspr-add-to-cart')) {
                e.preventDefault();
                this.addToCartFromRecommendation(e.target);
            }
        });

        // Handle campaign widget product link clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.upspr-product-link') || e.target.closest('.upspr-product-link')) {
                this.trackCampaignClick(e.target);
            }
        });

        // Handle campaign widget add to cart clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.upspr-add-to-cart-btn')) {
                this.trackCampaignClick(e.target);
            }
        });
    }

    async loadRecommendations() {
        const containers = document.querySelectorAll('.upspr-recommendations-container');

        containers.forEach(async (container) => {
            const productId = container.dataset.productId;
            const context = container.dataset.context || 'single-product';

            if (productId) {
                try {
                    const recommendations = await this.fetchRecommendations(productId, context);
                    this.renderRecommendations(container, recommendations);
                } catch (error) {
                    console.error('Failed to load recommendations:', error);
                }
            }
        });
    }

    async fetchRecommendations(productId, context) {
        const response = await fetch(`${window.upspr_frontend.rest_url}recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.upspr_frontend.nonce
            },
            body: JSON.stringify({
                product_id: productId,
                context: context
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recommendations');
        }

        return await response.json();
    }

    renderRecommendations(container, recommendations) {
        if (!recommendations || recommendations.length === 0) {
            container.style.display = 'none';
            return;
        }

        const html = recommendations.map(product => `
      <div class="upspr-recommendation-item" data-product-id="${product.id}">
        <div class="upspr-product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="upspr-product-details">
          <h4 class="upspr-product-title">${product.name}</h4>
          <div class="upspr-product-price">${product.price_html}</div>
          <button class="upspr-add-to-cart btn btn-primary" data-product-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `).join('');

        container.innerHTML = `
      <div class="upspr-recommendations-wrapper">
        <h3 class="upspr-recommendations-title">You might also like</h3>
        <div class="upspr-recommendations-grid">
          ${html}
        </div>
      </div>
    `;
    }

    trackRecommendationClick(element) {
        const productId = element.dataset.productId;

        // Send tracking data
        fetch(`${window.upspr_frontend.rest_url}track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.upspr_frontend.nonce
            },
            body: JSON.stringify({
                action: 'recommendation_click',
                product_id: productId,
                timestamp: Date.now()
            })
        }).catch(error => {
            console.error('Failed to track recommendation click:', error);
        });
    }

    async addToCartFromRecommendation(button) {
        const productId = button.dataset.productId;
        button.disabled = true;
        button.textContent = 'Adding...';

        try {
            const response = await fetch(`${window.wc_add_to_cart_params.wc_ajax_url.replace('%%endpoint%%', 'add_to_cart')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    product_id: productId,
                    quantity: 1
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            // Update cart count and fragments
            if (result.fragments) {
                Object.keys(result.fragments).forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        element.outerHTML = result.fragments[selector];
                    });
                });
            }

            // Track successful add to cart
            this.trackAddToCart(productId);

            button.textContent = 'Added!';
            setTimeout(() => {
                button.textContent = 'Add to Cart';
                button.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Failed to add to cart:', error);
            button.textContent = 'Failed';
            setTimeout(() => {
                button.textContent = 'Add to Cart';
                button.disabled = false;
            }, 2000);
        }
    }

    trackAddToCart(productId) {
        fetch(`${window.upspr_frontend.rest_url}track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.upspr_frontend.nonce
            },
            body: JSON.stringify({
                action: 'add_to_cart_from_recommendation',
                product_id: productId,
                timestamp: Date.now()
            })
        }).catch(error => {
            console.error('Failed to track add to cart:', error);
        });
    }

    trackCampaignClick(element) {
        // Find the campaign widget and product item
        const campaignWidget = element.closest('.upspr-campaign-widget');
        const productItem = element.closest('.upspr-product-item');

        if (!campaignWidget || !productItem) {
            return;
        }

        const campaignId = campaignWidget.dataset.campaignId;
        const productId = productItem.dataset.productId;

        if (!campaignId || !productId) {
            return;
        }

        // Store campaign interaction for conversion tracking
        this.storeCampaignInteraction(campaignId, productId);
        this.storeCampaignInteractionServer(campaignId, productId, 'click');

        // Send click tracking via AJAX to WordPress
        if (window.upspr_frontend && window.upspr_frontend.ajax_url) {
            const formData = new FormData();
            formData.append('action', 'upspr_track_click');
            formData.append('nonce', window.upspr_frontend.nonce);
            formData.append('campaign_id', campaignId);
            formData.append('product_id', productId);
            formData.append('campaign_type', 'cross-sell'); // Only track cross-sell for now

            fetch(window.upspr_frontend.ajax_url, {
                method: 'POST',
                body: formData
            }).catch(error => {
                console.error('Failed to track campaign click:', error);
            });
        }
    }

    storeCampaignInteraction(campaignId, productId) {
        // Store the campaign interaction in session storage for conversion tracking
        const key = `upspr_campaign_${productId}`;
        const interaction = {
            campaignId: campaignId,
            timestamp: Date.now(),
            type: 'click'
        };

        try {
            sessionStorage.setItem(key, JSON.stringify(interaction));
        } catch (error) {
            console.error('Failed to store campaign interaction:', error);
        }
    }

    storeCampaignInteractionServer(campaignId, productId, type) {
        // Also store on server for more reliable conversion tracking
        if (window.upspr_frontend && window.upspr_frontend.ajax_url) {
            const formData = new FormData();
            formData.append('action', 'upspr_store_campaign_interaction');
            formData.append('nonce', window.upspr_frontend.nonce);
            formData.append('campaign_id', campaignId);
            formData.append('product_id', productId);
            formData.append('type', type);

            fetch(window.upspr_frontend.ajax_url, {
                method: 'POST',
                body: formData
            }).catch(error => {
                console.error('Failed to store campaign interaction on server:', error);
            });
        }
    }
}

// Initialize frontend functionality
new UpsellSmartFrontend();
