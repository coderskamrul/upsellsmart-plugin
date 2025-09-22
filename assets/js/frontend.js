// Frontend JavaScript for tracking and interactions
;(($) => {
  // Declare the upspr_frontend variable
  const upspr_frontend = window.upspr_frontend

  // Initialize when DOM is ready
  $(document).ready(() => {
    initRecommendations()
  })

  function initRecommendations() {
    // Track impressions using Intersection Observer
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const $campaign = $(entry.target)
              const campaignId = $campaign.data("campaign-id")

              if (campaignId && !$campaign.data("impression-tracked")) {
                trackEvent("impression", campaignId, 0)
                $campaign.data("impression-tracked", true)
                observer.unobserve(entry.target)
              }
            }
          })
        },
        {
          threshold: 0.5, // Track when 50% visible
        },
      )

      $(".upspr-campaign").each(function () {
        observer.observe(this)
      })
    }

    // Track clicks on product links and buttons
    $(document).on("click", ".upspr-product a, .upspr-product button", function (e) {
      const $product = $(this).closest(".upspr-product")
      const $campaign = $(this).closest(".upspr-campaign")
      const productId = $product.data("product-id")
      const campaignId = $campaign.data("campaign-id")

      if (campaignId && productId) {
        trackEvent("click", campaignId, productId)
      }
    })

    // Track add to cart events
    $(document).on("click", ".upspr-product .add_to_cart_button", function (e) {
      const $product = $(this).closest(".upspr-product")
      const $campaign = $(this).closest(".upspr-campaign")
      const productId = $product.data("product-id")
      const campaignId = $campaign.data("campaign-id")

      if (campaignId && productId) {
        // Delay to ensure WooCommerce processes the add to cart
        setTimeout(() => {
          trackEvent("add_to_cart", campaignId, productId)
        }, 500)
      }
    })

    // Track conversions on order completion
    if ($("body").hasClass("woocommerce-order-received")) {
      trackOrderConversions()
    }
  }

  function trackEvent(eventType, campaignId, productId, revenue) {
    if (!upspr_frontend || !upspr_frontend.track_events) {
      return
    }

    $.post(upspr_frontend.ajax_url, {
      action: "upspr_track_event",
      nonce: upspr_frontend.nonce,
      event_type: eventType,
      recommendation_id: campaignId,
      product_id: productId || 0,
      revenue: revenue || 0,
    }).fail(() => {
      console.log("Failed to track event:", eventType)
    })
  }

  function trackOrderConversions() {
    // Get order details from the page or session storage
    const orderData = getOrderDataFromPage()

    if (orderData && orderData.items) {
      orderData.items.forEach((item) => {
        // Check if this product was recommended
        const campaignId = sessionStorage.getItem("upspr_last_campaign_" + item.product_id)
        if (campaignId) {
          trackEvent("conversion", campaignId, item.product_id, item.total)
          sessionStorage.removeItem("upspr_last_campaign_" + item.product_id)
        }
      })
    }
  }

  function getOrderDataFromPage() {
    // Extract order data from the order received page
    // This would need to be customized based on your theme
    const orderItems = []

    $(".woocommerce-order-overview__order .woocommerce-table tbody tr").each(function () {
      const $row = $(this)
      const productName = $row.find(".product-name").text()
      const productId = $row.data("product-id") // This would need to be added to the template
      const total = Number.parseFloat(
        $row
          .find(".product-total .amount")
          .text()
          .replace(/[^\d.]/g, ""),
      )

      if (productId) {
        orderItems.push({
          product_id: productId,
          name: productName,
          total: total,
        })
      }
    })

    return {
      items: orderItems,
    }
  }

  // Store campaign interactions in session storage for conversion tracking
  $(document).on("click", ".upspr-product a", function () {
    const $product = $(this).closest(".upspr-product")
    const $campaign = $(this).closest(".upspr-campaign")
    const productId = $product.data("product-id")
    const campaignId = $campaign.data("campaign-id")

    if (campaignId && productId) {
      sessionStorage.setItem("upspr_last_campaign_" + productId, campaignId)
    }
  })

  // Lazy loading for recommendation images
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove("lazy")
          imageObserver.unobserve(img)
        }
      })
    })

    $(".upspr-product img[data-src]").each(function () {
      imageObserver.observe(this)
    })
  }
})(window.jQuery)
