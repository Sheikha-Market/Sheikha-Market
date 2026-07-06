<?php

namespace App\Services;

use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * خدمة Google Analytics 4
 *
 * توفر الوصول الشامل إلى بيانات التحليلات والإحصائيات
 */
class GoogleAnalyticsService
{
    protected $client;
    protected $propertyId;

    public function __construct()
    {
        try {
            $this->client = new BetaAnalyticsDataClient([
                'credentials' => storage_path(
                    'app/google-analytics/' . config('services.google.analytics_key_file')
                ),
            ]);

            $this->propertyId = config('services.google.analytics_property_id');

            Log::channel('analytics')->info('Google Analytics متصل بنجاح');
        } catch (Exception $e) {
            Log::channel('analytics')->error('خطأ في الاتصال بـ GA4: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * الحصول على تقرير زيارات اليوم
     */
    public function getDailyReport($days = 30)
    {
        try {
            $request = new \Google\Analytics\Data\V1beta\RunReportRequest();
            $request->setProperty('properties/' . $this->propertyId);

            $dateRange = new DateRange();
            $dateRange->setStartDate(now()->subDays($days)->format('Y-m-d'));
            $dateRange->setEndDate(now()->format('Y-m-d'));
            $request->setDateRanges([$dateRange]);

            $dimensions = [
                new Dimension(['name' => 'date']),
            ];
            $request->setDimensions($dimensions);

            $metrics = [
                new Metric(['name' => 'activeUsers']),
                new Metric(['name' => 'newUsers']),
                new Metric(['name' => 'sessions']),
                new Metric(['name' => 'bounceRate']),
                new Metric(['name' => 'sessionDuration']),
            ];
            $request->setMetrics($metrics);

            $response = $this->client->runReport($request);

            $data = [];
            foreach ($response->getRows() as $row) {
                $data[] = [
                    'date' => $row->getDimensionValues()[0]->getValue(),
                    'active_users' => $row->getMetricValues()[0]->getValue(),
                    'new_users' => $row->getMetricValues()[1]->getValue(),
                    'sessions' => $row->getMetricValues()[2]->getValue(),
                    'bounce_rate' => $row->getMetricValues()[3]->getValue(),
                    'session_duration' => $row->getMetricValues()[4]->getValue(),
                ];
            }

            Log::channel('analytics')->info("تم الحصول على تقرير اليوم");

            return [
                'success' => true,
                'data' => $data,
            ];

        } catch (Exception $e) {
            Log::channel('analytics')->error("خطأ في الحصول على تقرير اليوم: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * الحصول على أهم الصفحات
     */
    public function getTopPages($limit = 10)
    {
        try {
            $request = new \Google\Analytics\Data\V1beta\RunReportRequest();
            $request->setProperty('properties/' . $this->propertyId);

            $dateRange = new DateRange();
            $dateRange->setStartDate(now()->subDays(30)->format('Y-m-d'));
            $dateRange->setEndDate(now()->format('Y-m-d'));
            $request->setDateRanges([$dateRange]);

            $dimensions = [
                new Dimension(['name' => 'pagePath']),
            ];
            $request->setDimensions($dimensions);

            $metrics = [
                new Metric(['name' => 'screenPageViews']),
                new Metric(['name' => 'engagementRate']),
                new Metric(['name' => 'averageSessionDuration']),
            ];
            $request->setMetrics($metrics);

            $orderBy = new \Google\Analytics\Data\V1beta\OrderBy();
            $orderBy->setMetric(new \Google\Analytics\Data\V1beta\OrderBy\MetricOrderBy(['metricName' => 'screenPageViews']));
            $orderBy->setDesc(true);
            $request->setOrderBys([$orderBy]);
            $request->setLimit($limit);

            $response = $this->client->runReport($request);

            $pages = [];
            foreach ($response->getRows() as $row) {
                $pages[] = [
                    'path' => $row->getDimensionValues()[0]->getValue(),
                    'views' => $row->getMetricValues()[0]->getValue(),
                    'engagement_rate' => $row->getMetricValues()[1]->getValue(),
                    'avg_duration' => $row->getMetricValues()[2]->getValue(),
                ];
            }

            Log::channel('analytics')->info("تم الحصول على أهم الصفحات");

            return [
                'success' => true,
                'pages' => $pages,
            ];

        } catch (Exception $e) {
            Log::channel('analytics')->error("خطأ في الحصول على أهم الصفحات: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * الحصول على معلومات المستخدمين
     */
    public function getUserDemographics()
    {
        try {
            $request = new \Google\Analytics\Data\V1beta\RunReportRequest();
            $request->setProperty('properties/' . $this->propertyId);

            $dateRange = new DateRange();
            $dateRange->setStartDate(now()->subDays(30)->format('Y-m-d'));
            $dateRange->setEndDate(now()->format('Y-m-d'));
            $request->setDateRanges([$dateRange]);

            $dimensions = [
                new Dimension(['name' => 'country']),
                new Dimension(['name' => 'language']),
                new Dimension(['name' => 'deviceCategory']),
            ];
            $request->setDimensions($dimensions);

            $metrics = [
                new Metric(['name' => 'activeUsers']),
                new Metric(['name' => 'newUsers']),
            ];
            $request->setMetrics($metrics);

            $response = $this->client->runReport($request);

            $demographics = [];
            foreach ($response->getRows() as $row) {
                $demographics[] = [
                    'country' => $row->getDimensionValues()[0]->getValue(),
                    'language' => $row->getDimensionValues()[1]->getValue(),
                    'device' => $row->getDimensionValues()[2]->getValue(),
                    'active_users' => $row->getMetricValues()[0]->getValue(),
                    'new_users' => $row->getMetricValues()[1]->getValue(),
                ];
            }

            Log::channel('analytics')->info("تم الحصول على معلومات السكان");

            return [
                'success' => true,
                'demographics' => $demographics,
            ];

        } catch (Exception $e) {
            Log::channel('analytics')->error("خطأ في الحصول على معلومات السكان: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * تتبع حدث مخصص
     */
    public function trackCustomEvent(string $eventName, array $parameters = [])
    {
        try {
            // هذا يتم من الواجهة الأمامية عبر gtag.js
            // لكن يمكن تسجيل الحدث في قاعدة البيانات
            \App\Models\AnalyticsEvent::create([
                'user_id' => auth()->id(),
                'event_name' => $eventName,
                'parameters' => json_encode($parameters),
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
            ]);

            Log::channel('analytics')->info("تم تتبع حدث: {$eventName}");

            return ['success' => true];

        } catch (Exception $e) {
            Log::channel('analytics')->error("خطأ في تتبع الحدث: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * الحصول على معدل التحويل
     */
    public function getConversionRate()
    {
        try {
            $request = new \Google\Analytics\Data\V1beta\RunReportRequest();
            $request->setProperty('properties/' . $this->propertyId);

            $dateRange = new DateRange();
            $dateRange->setStartDate(now()->subDays(30)->format('Y-m-d'));
            $dateRange->setEndDate(now()->format('Y-m-d'));
            $request->setDateRanges([$dateRange]);

            $metrics = [
                new Metric(['name' => 'conversions']),
                new Metric(['name' => 'sessions']),
            ];
            $request->setMetrics($metrics);

            $response = $this->client->runReport($request);

            $row = $response->getRows()[0] ?? null;

            if (!$row) {
                return [
                    'success' => true,
                    'conversion_rate' => 0,
                ];
            }

            $conversions = (int)$row->getMetricValues()[0]->getValue();
            $sessions = (int)$row->getMetricValues()[1]->getValue();
            $conversionRate = $sessions > 0 ? ($conversions / $sessions) * 100 : 0;

            Log::channel('analytics')->info("معدل التحويل: {$conversionRate}%");

            return [
                'success' => true,
                'conversions' => $conversions,
                'sessions' => $sessions,
                'conversion_rate' => round($conversionRate, 2),
            ];

        } catch (Exception $e) {
            Log::channel('analytics')->error("خطأ في الحصول على معدل التحويل: {$e->getMessage()}");
            throw $e;
        }
    }
}
