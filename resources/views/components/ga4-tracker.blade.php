<!-- Google Analytics 4 Tracker -->
@if(config('services.google.analytics_measurement_id'))
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.google.analytics_measurement_id') }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '{{ config("services.google.analytics_measurement_id") }}', {
            'page_path': window.location.pathname,
            'page_title': document.title,
        });

        // تتبع أحداث مخصصة
        function trackEvent(eventName, eventData = {}) {
            gtag('event', eventName, {
                'user_id': @json(auth()->user()?->id),
                ...eventData
            });

            // إرسال الحدث إلى الخادم
            fetch('{{ route("files.track_event") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    event_name: eventName,
                    parameters: eventData,
                }),
            }).catch(err => console.error('Error tracking event:', err));
        }

        // تتبع عند النقر على المنتجات
        document.addEventListener('click', function(e) {
            const productElement = e.target.closest('[data-product-id]');
            if (productElement) {
                trackEvent('product_click', {
                    product_id: productElement.dataset.productId,
                    product_name: productElement.dataset.productName,
                });
            }
        });

        // تتبع عند إضافة إلى السلة
        document.addEventListener('add-to-cart', function(e) {
            trackEvent('add_to_cart', {
                product_id: e.detail.productId,
                product_name: e.detail.productName,
                price: e.detail.price,
                quantity: e.detail.quantity,
            });
        });

        // تتبع عند الشراء
        document.addEventListener('purchase', function(e) {
            trackEvent('purchase', {
                transaction_id: e.detail.transactionId,
                value: e.detail.total,
                currency: 'SAR',
                items: e.detail.items,
            });
        });
    </script>
@endif
