import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ExternalLink, Play, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Video {
  id: number;
  title: string;
  url: string;
  thumbnail?: string;
  category?: string;
  color?: string;
  created_at: string;
}

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filters
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [categories, setCategories] = useState<string[]>([]);

  // Command palette
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('category');

      if (error) return;
      const unique = Array.from(
        new Set(
          (data || [])
            .map((r) => r.category)
            .filter((c): c is string => !!c && c.trim().length > 0)
        )
      ).sort((a, b) => a.localeCompare(b, 'ar'));
      setCategories(unique);
    } catch (_) {
      // ignore category errors silently
    }
  }, []);

  const fetchVideos = useCallback(
    async (q: string, category: string, s: typeof sort) => {
      try {
        setLoading(true);
        let request = supabase.from('videos').select('*');

        const term = q.trim();
        if (term) {
          request = request.or(
            `title.ilike.%${term}%,category.ilike.%${term}%`
          );
        }

        if (category !== 'all') {
          request = request.eq('category', category);
        }

        if (s === 'title') {
          request = request.order('title', { ascending: true });
        } else {
          request = request.order('created_at', { ascending: s === 'oldest' });
        }

        const { data, error } = await request;
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
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch on filters with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      fetchVideos(query, selectedCategory, sort);
    }, 300);
    return () => clearTimeout(t);
  }, [query, selectedCategory, sort, fetchVideos]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleWatchVideo = (url: string) => {
    window.open(url, '_blank');
  };

  const categoryLabel = useCallback((value: string) => {
    if (value === 'all') return 'الكل';
    return value || 'غير مصنف';
  }, []);

  // UI helpers
  const getColorGradient = useCallback((color: string) => {
    switch (color?.toLowerCase()) {
      case 'blue':
      case 'أزرق':
        return 'from-blue-600/80 to-blue-800/80';
      case 'green':
      case 'أخضر':
        return 'from-green-600/80 to-green-800/80';
      case 'purple':
      case 'بنفسجي':
        return 'from-purple-600/80 to-purple-800/80';
      case 'red':
      case 'أحمر':
        return 'from-red-600/80 to-red-800/80';
      case 'orange':
      case 'برتقالي':
        return 'from-orange-600/80 to-orange-800/80';
      case 'teal':
      case 'أخضر مزرق':
        return 'from-teal-600/80 to-teal-800/80';
      default:
        return 'from-gray-800/80 to-gray-900/80';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" dir="rtl">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
            <Play className="h-6 w-6" />
            <span>Islamic Video Hub</span>
          </div>

          <div className="hidden md:flex items-center gap-2 w-full max-w-xl">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن فيديو بالعنوان أو التصنيف"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-9"
              />
            </div>
            <Button variant="secondary" onClick={() => setIsCmdOpen(true)}>
              البحث السريع ⌘K
            </Button>
          </div>

          <div className="md:hidden">
            <Button size="sm" variant="secondary" onClick={() => setIsCmdOpen(true)}>
              ⌘K
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            مكتبة الفيديوهات الإسلامية
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            مجموعة مختارة من الفيديوهات الإسلامية النافعة
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/60 dark:bg-gray-900/50 backdrop-blur border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:hidden">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن فيديو بالعنوان أو التصنيف"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted-foreground">التصنيف</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted-foreground">الترتيب</label>
              <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="oldest">الأقدم</SelectItem>
                  <SelectItem value="title">العنوان (أ-ي)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => { setQuery(''); setSelectedCategory('all'); setSort('newest'); }}>
                مسح التصفية
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden h-64">
                <CardHeader>
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد نتائج مطابقة</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">جرّب تعديل كلمات البحث أو مسح التصفية</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-64"
                style={{
                  backgroundImage: `url(${video.thumbnail || '/placeholder.svg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                onClick={() => handleWatchVideo(video.url)}
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${getColorGradient(video.color || '')} flex flex-col justify-between p-4`}>
                  {video.category && (
                    <div className="self-start">
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {video.category}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                      {video.title}
                    </h3>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWatchVideo(video.url);
                      }}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 hover:border-white/50 transition-all duration-300 w-fit"
                      size="sm"
                    >
                      <Play className="h-4 w-4 ml-2" />
                      مشاهدة
                    </Button>
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
              </div>
            ))}
          </div>
        )}

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
            <ul className="list-disc list-inside mr-6 mt-1 space-y-1">
              <li><strong>title:</strong> عنوان الفيديو</li>
              <li><strong>url:</strong> رابط الفيديو (YouTube, Vimeo, إلخ)</li>
              <li><strong>thumbnail:</strong> رابط صورة الفيديو (اختياري)</li>
              <li><strong>category:</strong> تصنيف الفيديو (اختياري)</li>
              <li><strong>color:</strong> لون التدرج (blue, green, purple, red, orange, teal - اختياري)</li>
            </ul>
            <li>اضغط "Save" وسيظهر الفيديو الجديد تلقائياً</li>
          </ol>
        </div>
      </main>

      {/* Command Palette */}
      <CommandDialog open={isCmdOpen} onOpenChange={setIsCmdOpen}>
        <CommandInput placeholder="ابحث بسرعة عن فيديو أو تصنيف..." />
        <CommandList>
          <CommandEmpty>لا توجد نتائج</CommandEmpty>

          <CommandGroup heading="الفيديوهات">
            {videos.map((v) => (
              <CommandItem
                key={`v-${v.id}`}
                value={`${v.title} ${v.category ?? ''}`}
                onSelect={() => {
                  setIsCmdOpen(false);
                  handleWatchVideo(v.url);
                }}
              >
                <Play className="h-4 w-4 ml-2" />
                <span className="truncate">{v.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="التصنيفات">
            {['all', ...categories].map((c) => (
              <CommandItem
                key={`c-${c}`}
                value={c}
                onSelect={() => {
                  setSelectedCategory(c);
                  setIsCmdOpen(false);
                }}
              >
                <span>{categoryLabel(c)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default Index;
