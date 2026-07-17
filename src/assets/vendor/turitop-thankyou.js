/*
 * TuriTop "Purchase URL" conversion snippet, version 1.11 — VENDOR CODE, VERBATIM.
 *
 * Kept byte-for-byte as TuriTop supplied it (the two <script> bodies from
 * turitop-dd-thankyou.html, concatenated in source order) so a vendor update is
 * a file swap rather than a re-port. Do not reformat or "fix" it.
 *
 * Loaded as an external file because Angular's template compiler strips
 * <script> out of templates — pasted inline, this would silently emit nothing.
 * ThankYou injects it after render, so the ticket container that fill_tickets()
 * writes into already exists.
 *
 * It reads booking_id/total/currency from the query string TuriTop redirects
 * with, fires the Google Ads conversion + GA4 purchase via the global gtag()
 * from index.html, and pushes to dataLayer for GTM-PB24J4GH (inert: no GTM
 * container is installed on this site).
 */

    function turitop_booking_system_thank_page() {}

    turitop_booking_system_thank_page.prototype.init = function(){

        /* ############################################
        ####      Parameter from google ads     ####
        ############################################ */

        this.send_to = []; this.send_to.push( 'AW-11199515913/aophCIT4prwaEJm2rNwp' );
        /* ############################################ */

        /* ############################################ */

        /* ############################################
        ####      Parameter from google analytics 4    ####
        ############################################ */
    this.ga4 = 'G-QN1CZT8HXQ';
    /* ############################################ */

    /* ############################################
       ####      Parameter from google tag manager    ####
       ############################################ */
    this.gtm = 'GTM-PB24J4GH';
    /* ############################################ */

        this.current_url = window.location.search;
        this.current_url_params = new URLSearchParams( this.current_url );

        /* ############################################
            ####      Parameter from facebook ads     ####
            ############################################ */
    this.fbpixel = ' ';
    if (typeof this.fbpixel === 'undefined' || typeof this.fbpixel === null || 0 === this.fbpixel.length){
            this.fbpixel = this.current_url_params.get( 'fbpixel' );
        }

    this.sPageURL = decodeURIComponent( window.location.search.substring( 1 ) );
    this.currency = this.current_url_params.get( 'currency' );
    this.base_url = this.current_url_params.get( 'd' );
    this.lang = this.current_url_params.get( 'lang' );
    this.csid = this.current_url_params.get( 'csid' );
    this.company_name = this.current_url_params.get( 'company_name' );
    this.product_short_id = this.current_url_params.get( 'product_short_id' );
    this.product_name = this.current_url_params.get( 'product_name' );
    this.shopping_cart_id = this.current_url_params.get( 'shopping_cart_id' );
    this.multiclient_hash = this.current_url_params.get( 'multiclient_hash' );
    this.client_name = this.current_url_params.get( 'client_name' );
    this.client_email = this.current_url_params.get( 'client_email' );
    this.client_names = this.current_url_params.get( 'client_name[]' );
    this.client_emails = this.current_url_params.get( 'client_email[]' );
    this.buyer_email = this.current_url_params.get( 'buyer_email' );
    this.payment_link = this.current_url_params.get( 'payment_link' );
    this.totals = 0;
    this.transaction_id = '';
    this.redsys_merchant_parameters = this.current_url_params.get( 'Ds_MerchantParameters' );
    this.name_commerce = ' ';
    this.commerce_url = ' ';
    this.booking_short_id = this.getUrlParameter( 'booking_id[]' );
        if ( typeof this.booking_short_id === 'undefined' || this.booking_short_id === null || 0 === this.booking_short_id.length ) {
            this.booking_short_id = this.current_url_params.get( 'booking_id' );
        }
        this.product_description = this.current_url_params.get( 'product_description' );

        this.tickets = [];

        this.events();

    };

    turitop_booking_system_thank_page.prototype.events = function(){

        this.get_totals();

        this.get_transaction_id();

        if ( this.payment_link == null || this.payment_link != 1 ){

            if ( this.send_to || 0 != this.send_to || typeof this.send_to != 'undefined' ){
                this.send_purchase_event_to_google_ads();
            }

            if ( this.fbpixel || 0 != this.fbpixel || typeof this.fbpixel != 'undefined' ){
                this.send_purchase_event_to_facebook_ads();
            }

            if ( this.ga4 || 0 != this.ga4.length || typeof this.ga4 != 'undefined' && 0 == this.gtm.length ){
                this.send_purchase_event_to_google_analytics_4();
            }

            if ( this.gtm || 0 != this.gtm.length || typeof this.gtm != 'undefined' && 0 == this.ga4.length ){
                this.send_purchase_event_to_google_tag_manager();
            }
        }
    };

    turitop_booking_system_thank_page.prototype.fixUtf8Garbage = function( input ){

        const bytes = new Uint8Array([...input].map(c => c.charCodeAt(0)));
        return new TextDecoder('utf-8').decode(bytes);

    };  

    turitop_booking_system_thank_page.prototype.getUrlParameter = function( sParam ){

        var array =[]
        var sURLVariables = this.sPageURL.split('&');
        for ( var i = 0; i < sURLVariables.length; i++ ) {
            var sParameterName = sURLVariables[ i ].split( '=' );
            if ( sParameterName[ 0 ] == sParam ) {
                array.push( sParameterName[ 1 ] );
            }
        }
        return array;

    };

    turitop_booking_system_thank_page.prototype.get_totals = function(){

        var total = this.getUrlParameter( 'total[]' );
        if ( ! total || 0 === total.length || typeof total == 'undefined' ){

        this.total = this.current_url_params.get( 'total' );

        }
        else{

            var out = parseFloat( 0 );
            for ( var i in total ) {
                    out = out + parseFloat( total[i] );
                }
            this.total = out;
        }

    };

    turitop_booking_system_thank_page.prototype.get_transaction_id = function(){

        var booking_id = this.getUrlParameter( 'booking_id[]' );
        if ( ! booking_id || 0 === booking_id.length || typeof booking_id == 'undefined' ){

          this.transaction_id = this.current_url_params.get( 'booking_id' );

          var ticket = {
            booking_id: this.transaction_id,
            url: this.base_url + this.current_url_params.get( 'link' ),
            price: this.total
          }
          this.tickets.push( ticket );

        }
        else{

            var link = this.getUrlParameter( 'link[]' );
            var price = this.getUrlParameter( 'price[]' );
            var out = '';
            var cart_id = '';
            var multiclient = '';
            if ( this.shopping_cart_id != null ){
                cart_id = this.shopping_cart_id;
                multiclient = '';
            }
             if ( this.multiclient_hash != null ){
                multiclient = this.multiclient_hash;
                cart_id = '';
            }

            for ( var i in booking_id ) {

                var ticket = {
                    booking_id: booking_id[ i ],
                    url: this.base_url + link[ i ],
                    price: price[ i ],
                    cart_id: cart_id,
                    multiclient: multiclient
                }
                this.tickets.push( ticket );

                out += "-Booking-" + booking_id[ i ];
                this.buttons = [];
            }
            this.transaction_id = out;

        }

    };


    turitop_booking_system_thank_page.prototype.send_purchase_event_to_google_ads = function(){

        if (typeof gtag === 'function') {
            for ( var i in this.send_to ) {

                gtag('event', 'conversion', {
                    'send_to': this.send_to[ i ],
                    'value': this.total,
                    'currency': this.currency,
                    'transaction_id': this.transaction_id
                });

            }
        }
    };

    turitop_booking_system_thank_page.prototype.send_purchase_event_to_facebook_ads = function(){

        if (typeof fbq === 'function') {

            if ( typeof this.fbpixel != 'undefined' || this.fbpixel ){
                fbq( 'track', 'Purchase', {
                    'value': this.total,
                    'currency': this.currency
                  });
            }
        }
    };

    turitop_booking_system_thank_page.prototype.send_purchase_event_to_google_analytics_4 = function(){

        if (typeof gtag === 'function') {

            if ( 0 != this.ga4.length ){
                var tid = '';

                for ( var i in this.tickets ) {
                    if ( this.tickets[i].cart_id != '' ){
                        tid = this.tickets[i].cart_id;
                    }
                    if ( this.tickets[i].multiclient != '' ){
                        tid = this.tickets[i].multiclient;
                    }
                    if ( typeof this.tickets[i].multiclient == 'undefined' || typeof this.tickets[i].cart_id == 'undefined' ) {
                        tid = this.tickets[i].booking_id;
                    }
                    gtag('event', 'purchase', {
                        'transaction_id': tid, //IF shopping cart, shopping cart id, IF multiclient, multiclient hash, ELSE, booking number
                        'currency': this.currency, // local currency code
                        'value': this.total, //Valor total
                        'items': [
                            { //one item per product bought
                            'item_id': this.product_short_id, //Short_id product
                            'item_name': this.product_name, //Nombre del producto en idioma original
                            'item_brand': this.csid + '-' + this.company_name, //company short ID + nombre empresa. En caso de reventa, usar datos del proveedor
                            'item_category': this.lang, //Language
                            'price': this.tickets[i].price, //Valor pagado por producto comprado, ejemplo 9.99
                            'currency': this.currency, // local currency code product
                            'quantity': 1 //Aquí siempre se pone 1, aunque se hayan comprado varios tipos de tickets
                            }
                        ]
                    });
                }
            }
        }
    };

    turitop_booking_system_thank_page.prototype.send_purchase_event_to_google_tag_manager = function(){

        if ( 0 != this.gtm.length ){
            var tid = '';

            for ( var i in this.tickets ) {
                if ( this.tickets[i].cart_id != '' ){
                    tid = this.tickets[i].cart_id;
                }
                if ( this.tickets[i].multiclient != '' ){
                    tid = this.tickets[i].multiclient;
                }
                if ( typeof this.tickets[i].multiclient == 'undefined' || typeof this.tickets[i].cart_id == 'undefined' ) {
                    tid = this.tickets[i].booking_id;
                }
                dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                event: "purchase",
                ecommerce: {
                    transaction_id: tid, //IF shopping cart, shopping cart id, IF multiclient, multiclient hash, ELSE, booking number
                    currency: this.currency, // local currency code
                    value: this.total, //Valor total
                    items: [
                        { //one item per product bought
                        item_id: this.product_short_id, //Short_id product
                        item_name: this.product_name, //Nombre del producto en idioma original
                        item_brand: this.csid + '-' + this.company_name, //company short ID + nombre empresa. En caso de reventa, usar datos del proveedor
                        item_category: this.lang, //Language
                        price: this.tickets[i].price, //Valor pagado por producto comprado, ejemplo 9.99
                        currency: this.currency, // local currency code product
                        quantity: 1 //Aquí siempre se pone 1, aunque se hayan comprado varios tipos de tickets
                        }
                    ]
                }
                });
            }
        }
};

turitop_booking_system_thank_page.prototype.fill_tickets = function(){

    for ( var i in this.tickets ) {

    var html = '<div class="turitop_thank_you_page_ticket">';

        html = html + '<div class="turitop_thank_you_page_ticket_booking_id">';
            html = html + this.tickets[i].booking_id;
        html = html + '</div>';

        html = html + '<div class="turitop_thank_you_page_ticket_url">';
            html = html + '<a href="' + this.tickets[i].url + '" target="_blank"> <button>Download/Print</button> </a>';       html = html + '</div>';

   html = html + '</div>';

   document.getElementById( "turitop_thank_you_page_tickets" ).insertAdjacentHTML( "afterbegin", html );

   }

   if ( this.tickets.length > 1 )
       var tickets_title ="Your reference numbers:";
else
var tickets_title ="Your reference number:";
    var name = '';
    var email = '';

    if ( this.client_name != null ) {
        var name = this.client_name;
    }
    if ( this.client_names != null ) {
        var name = this.client_names;
    }
    if ( this.client_email != null) {
        var email = this.client_email;
    }
    if ( this.client_emails != null) {
        var email = this.client_emails;
    }
if ( this.booking_short_id != null ) {
html_booking_data = '<div class="turitop_thank_you_page_booking_data">Booking data</div>';
html_booking_data =  html_booking_data + '<div class="turitop_thank_you_page_booking_data">' +"Booking Number"+ ": " + this.booking_short_id + '</div>';
    }
if ( name != '' ) {
    html_booking_data =  html_booking_data + '<div class="turitop_thank_you_page_booking_data">' +"Name"+ ": " + name + '</div>';
}
if ( email != '' ) {
html_booking_data = html_booking_data + '<div class="turitop_thank_you_page_booking_data">' +"Email"+ ": " + email +'</div>';
}
if ( this.buyer_email != null  ) {
    html_booking_data = html_booking_data + '<div class="turitop_thank_you_page_booking_data">' +"Buyer email"+ ": " + this.buyer_email +'</div>';
}
if ( this.product_name != null ) {
    html_booking_data = html_booking_data + '<div class="turitop_thank_you_page_booking_data">' +"Reserved product"+ ": " + this.product_name +'</div>';
}
if ( this.total != null ) {
    html_booking_data = html_booking_data + '<div class="turitop_thank_you_page_booking_data">' +"Total"+ ": " + this.total + " " + this.currency +'</div>'; 
    } 
var html_redsys_data = null;
if ( this.redsys_merchant_parameters != null ) {
    const redsys_data = atob(this.redsys_merchant_parameters);
    const redsys_data_json = JSON.parse(redsys_data);
    const product_description_decode = atob(this.product_description);
    html_redsys_data = '<div class="turitop_thank_you_page_redsys_data">' +"Redsys payment data" + '</div>';
    html_redsys_data = html_redsys_data + '<div class="turitop_thank_you_page_redsys_data">' +"FUC of commerce"+ ": " + redsys_data_json.Ds_MerchantCode +'</div>';
    html_redsys_data = html_redsys_data + '<div class="turitop_thank_you_page_redsys_data">' +"Transaction amount"+ ": " + parseFloat(redsys_data_json.Ds_Amount)/100  +'</div>';
    html_redsys_data = html_redsys_data + '<div class="turitop_thank_you_page_redsys_data">' +"Authorization code"+ ": " + redsys_data_json.Ds_AuthorisationCode +'</div>';
    html_redsys_data = html_redsys_data + '<div class="turitop_thank_you_page_redsys_data">' +"Date/time of operation"+ ": " + decodeURIComponent(redsys_data_json.Ds_Date)  + " " + decodeURIComponent(redsys_data_json.Ds_Hour)  +'</div>';
    html_redsys_data = html_redsys_data + '<div class="turitop_thank_you_page_redsys_data">' +"Name of commerce"+ ": " + this.name_commerce +'</div>';
    html_redsys_data = html_redsys_data + '<div class="turitop_thank_you_page_redsys_data">' +"URL of commerce"+ ": " + this.commerce_url +'</div>';
   if ( this.product_description != null ) {
        const product_description_utf8 = this.fixUtf8Garbage(product_description_decode);
        html_redsys_data = html_redsys_data + '<div class="turitop_thank_you_page_redsys_data">' +"Product description"+ ": " + product_description_utf8 +'</div>';
      } 
      html_redsys_data = html_redsys_data +'<br>';
  }
      document.getElementById( "turitop_thank_you_page_tickets" ).insertAdjacentHTML( "afterbegin", '<div class="turitop_thank_you_page_tickets_title">' + tickets_title + '</div>' );
      document.getElementById( "turitop_thank_you_page_tickets" ).insertAdjacentHTML( "afterend", html_booking_data );
      if ( html_redsys_data !== null ) {
          document.getElementById( "turitop_thank_you_page_tickets" ).insertAdjacentHTML( "afterend", html_redsys_data );
      }
  };
    var turitop_booking_system_thank_page_instance = new turitop_booking_system_thank_page();
    turitop_booking_system_thank_page_instance.init();

    
    turitop_booking_system_thank_page_instance.fill_tickets();

    
