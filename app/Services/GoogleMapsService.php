<?php

namespace App\Services;

use Google\Maps\Service;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * خدمة Google Maps المتكاملة
 *
 * توفر جميع خدمات الخرائط والموقع الجغرافي والتوجيه
 */
class GoogleMapsService
{
    protected $mapsService;
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.google.maps_api_key');

        if (!$this->apiKey) {
            Log::channel('maps')->warning('مفتاح Google Maps API غير معرّف');
        }
    }

    /**
     * البحث عن عنوان من الإحداثيات (Reverse Geocoding)
     */
    public function reverseGeocode($latitude, $longitude)
    {
        try {
            $url = sprintf(
                'https://maps.googleapis.com/maps/api/geocode/json?latlng=%s,%s&key=%s&language=ar',
                $latitude,
                $longitude,
                $this->apiKey
            );

            $response = \Http::get($url);
            $data = $response->json();

            if ($data['status'] === 'OK') {
                $address = $data['results'][0]['formatted_address'];

                Log::channel('maps')->info("تم الحصول على العنوان: {$address}");

                return [
                    'success' => true,
                    'address' => $address,
                    'components' => $data['results'][0]['address_components'],
                ];
            }

            return ['success' => false, 'error' => $data['status']];

        } catch (Exception $e) {
            Log::channel('maps')->error("خطأ في البحث العكسي: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * الحصول على الإحداثيات من عنوان (Geocoding)
     */
    public function geocode($address)
    {
        try {
            $url = sprintf(
                'https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s&language=ar',
                urlencode($address),
                $this->apiKey
            );

            $response = \Http::get($url);
            $data = $response->json();

            if ($data['status'] === 'OK') {
                $location = $data['results'][0]['geometry']['location'];

                Log::channel('maps')->info("تم الحصول على الإحداثيات للعنوان: {$address}");

                return [
                    'success' => true,
                    'latitude' => $location['lat'],
                    'longitude' => $location['lng'],
                    'address' => $data['results'][0]['formatted_address'],
                ];
            }

            return ['success' => false, 'error' => $data['status']];

        } catch (Exception $e) {
            Log::channel('maps')->error("خطأ في البحث الجغرافي: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * حساب المسافة والمدة بين نقطتين
     */
    public function getDistanceMatrix($origins, $destinations, $mode = 'driving')
    {
        try {
            $url = sprintf(
                'https://maps.googleapis.com/maps/api/distancematrix/json?origins=%s&destinations=%s&mode=%s&key=%s&language=ar',
                urlencode($origins),
                urlencode($destinations),
                $mode,
                $this->apiKey
            );

            $response = \Http::get($url);
            $data = $response->json();

            if ($data['status'] === 'OK') {
                $element = $data['rows'][0]['elements'][0];

                Log::channel('maps')->info("تم حساب المسافة بنجاح");

                return [
                    'success' => true,
                    'distance' => $element['distance']['text'],
                    'distance_km' => $element['distance']['value'] / 1000,
                    'duration' => $element['duration']['text'],
                    'duration_seconds' => $element['duration']['value'],
                ];
            }

            return ['success' => false, 'error' => $data['status']];

        } catch (Exception $e) {
            Log::channel('maps')->error("خطأ في حساب المسافة: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * البحث عن الأماكن القريبة
     */
    public function nearbySearch($latitude, $longitude, $type, $radius = 5000)
    {
        try {
            $url = sprintf(
                'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=%s,%s&radius=%s&type=%s&key=%s&language=ar',
                $latitude,
                $longitude,
                $radius,
                $type,
                $this->apiKey
            );

            $response = \Http::get($url);
            $data = $response->json();

            if ($data['status'] === 'OK') {
                $places = array_map(function($place) {
                    return [
                        'name' => $place['name'],
                        'latitude' => $place['geometry']['location']['lat'],
                        'longitude' => $place['geometry']['location']['lng'],
                        'rating' => $place['rating'] ?? 'N/A',
                        'vicinity' => $place['vicinity'],
                        'types' => $place['types'],
                    ];
                }, $data['results']);

                Log::channel('maps')->info("تم البحث عن أماكن قريبة: " . count($places) . " نتيجة");

                return [
                    'success' => true,
                    'places' => $places,
                    'total' => count($places),
                ];
            }

            return ['success' => false, 'error' => $data['status']];

        } catch (Exception $e) {
            Log::channel('maps')->error("خطأ في البحث عن أماكن: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * الحصول على تفاصيل مكان معين
     */
    public function getPlaceDetails($placeId)
    {
        try {
            $url = sprintf(
                'https://maps.googleapis.com/maps/api/place/details/json?place_id=%s&key=%s&language=ar',
                $placeId,
                $this->apiKey
            );

            $response = \Http::get($url);
            $data = $response->json();

            if ($data['status'] === 'OK') {
                $result = $data['result'];

                Log::channel('maps')->info("تم الحصول على تفاصيل المكان: {$result['name']}");

                return [
                    'success' => true,
                    'name' => $result['name'],
                    'address' => $result['formatted_address'],
                    'phone' => $result['formatted_phone_number'] ?? 'N/A',
                    'website' => $result['website'] ?? '',
                    'rating' => $result['rating'] ?? 'N/A',
                    'reviews' => $result['reviews'] ?? [],
                    'opening_hours' => $result['opening_hours'] ?? [],
                ];
            }

            return ['success' => false, 'error' => $data['status']];

        } catch (Exception $e) {
            Log::channel('maps')->error("خطأ في الحصول على تفاصيل المكان: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * الحصول على رابط خريطة مضمّنة
     */
    public function getEmbedMapUrl($address, $width = 800, $height = 600)
    {
        return sprintf(
            'https://www.google.com/maps/embed/v1/place?q=%s&key=%s&zoom=15&maptype=roadmap',
            urlencode($address),
            $this->apiKey
        );
    }

    /**
     * الحصول على رابط الخريطة الثابتة
     */
    public function getStaticMapUrl($latitude, $longitude, $zoom = 15, $size = '800x600')
    {
        return sprintf(
            'https://maps.googleapis.com/maps/api/staticmap?center=%s,%s&zoom=%s&size=%s&markers=color:red|%s,%s&key=%s',
            $latitude,
            $longitude,
            $zoom,
            $size,
            $latitude,
            $longitude,
            $this->apiKey
        );
    }
}
