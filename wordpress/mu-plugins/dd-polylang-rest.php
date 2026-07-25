<?php
/**
 * Plugin Name: DD Polylang REST bridge
 * Description: Exposes Polylang language + published-translation slugs on the REST
 *              API and lets ?lang= filter queries, for the headless Angular site
 *              (diocletiansdream.com). Free-Polylang equivalent of the Pro REST
 *              integration.
 *
 * DEPLOY: copy this file to `wp-content/mu-plugins/dd-polylang-rest.php` on the
 * CMS (cms.diocletiansdream.com). mu-plugins load automatically and survive
 * plugin activation/deactivation. No activation step needed.
 *
 * VERIFY after deploy:
 *   GET /wp-json/wp/v2/posts?lang=hr&per_page=100&_fields=id,slug,lang,translations
 *     -> Croatian posts, each with lang:"hr" and translations {en:"...",hr:"..."}.
 *   GET /wp-json/wp/v2/posts?lang=en&_fields=slug
 *     -> the English posts only.
 *
 * The Angular app also requires the hr posts to be PUBLISHED (the public REST
 * API never returns drafts).
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    foreach (['post'] as $type) {
        register_rest_field($type, 'lang', [
            'get_callback' => function ($obj) {
                return function_exists('pll_get_post_language')
                    ? pll_get_post_language($obj['id'], 'slug')
                    : null;
            },
        ]);

        // lang -> slug, PUBLISHED translations only, so the frontend never emits
        // an hreflang to a draft/nonexistent page.
        register_rest_field($type, 'translations', [
            'get_callback' => function ($obj) {
                if (!function_exists('pll_get_post_translations')) {
                    return (object) [];
                }
                $out = [];
                foreach (pll_get_post_translations($obj['id']) as $lang => $id) {
                    $p = get_post($id);
                    if ($p && $p->post_status === 'publish') {
                        $out[$lang] = $p->post_name; // slug
                    }
                }
                return (object) $out;
            },
        ]);
    }
});

// Honor ?lang= on post queries so the headless app can request one language.
add_filter('rest_post_query', function ($args, $request) {
    $lang = $request->get_param('lang');
    if ($lang) {
        $args['lang'] = $lang;
    }
    return $args;
}, 10, 2);
