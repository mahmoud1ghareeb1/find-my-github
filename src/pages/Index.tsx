import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play } from 'lucide-react';
import { toast } from 'sonner';

interface Video {
  id: number;
  title: string;
  url: string;
  thumbnail?: string;
  category?: string;
  created_at: string;
}

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('خطأ في تحميل الفيديوهات');
        return;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('خطأ في الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchVideo = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Play className="h-8 w-8" />
              Islamic Video Hub
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            مكتبة الفيديوهات الإسلامية
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            مجموعة مختارة من الفيديوهات الإسلامية النافعة
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              لا توجد فيديوهات متاحة حالياً
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              يمكنك إضافة فيديوهات جديدة من لوحة تحكم Supabase
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={video.thumbnail || '/placeholder.svg'}
                      alt={video.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {video.title}
                  </CardTitle>
                  {video.category && (
                    <div className="mb-3">
                      <span className="inline-block bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs px-2 py-1 rounded-full">
                        {video.category}
                      </span>
                    </div>
                  )}
                  <Button
                    onClick={() => handleWatchVideo(video.url)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    مشاهدة الفيديو
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions for adding videos */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            كيفية إضافة فيديوهات جديدة:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>ادخل إلى لوحة تحكم Supabase الخاصة بمشروعك</li>
            <li>اختر "Table Editor" من القائمة الجانبية</li>
            <li>اختر جدول "videos"</li>
            <li>اضغط على "Insert" → "Insert row"</li>
            <li>املأ البيانات المطلوبة:</li>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li><strong>title:</strong> عنوان الفيديو</li>
              <li><strong>url:</strong> رابط الفيديو (YouTube, Vimeo, إلخ)</li>
              <li><strong>thumbnail:</strong> رابط صورة الفيديو (اختياري)</li>
              <li><strong>category:</strong> تصنيف الفيديو (اختياري)</li>
            </ul>
            <li>اضغط "Save" وسيظهر الفيديو الجديد تلقائياً</li>
          </ol>
        </div>
      </main>
    </div>
  );
};

export default Index;
