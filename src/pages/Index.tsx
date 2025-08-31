import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Play, Search, Users, Video as VideoIcon, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Speaker {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  video_count?: number;
}

interface Video {
  id: number;
  title: string;
  url: string;
  thumbnail?: string;
  category?: string;
  color?: string;
  created_at: string;
  speaker_id?: string;
  speakers?: Speaker;
}

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch videos with speakers
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          *,
          speakers(*)
        `)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      // Fetch speakers with video count
      const { data: speakersData, error: speakersError } = await supabase
        .from('speakers')
        .select(`
          *,
          videos(count)
        `)
        .order('created_at', { ascending: false });

      if (speakersError) throw speakersError;

      // Process speakers data to get video count
      const processedSpeakers = speakersData?.map(speaker => ({
        ...speaker,
        video_count: speaker.videos?.[0]?.count || 0
      })) || [];

      setVideos(videosData || []);
      setSpeakers(processedSpeakers);
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

  const getColorGradient = (color: string) => {
    const gradients: { [key: string]: string } = {
      blue: "from-blue-600/80 to-blue-800/80",
      green: "from-green-600/80 to-green-800/80",
      purple: "from-purple-600/80 to-purple-800/80",
      red: "from-red-600/80 to-red-800/80",
      orange: "from-orange-600/80 to-orange-800/80",
      teal: "from-teal-600/80 to-teal-800/80",
    };
    return gradients[color?.toLowerCase()] || gradients.blue;
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (video.category && video.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (video.speakers && video.speakers.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSpeakers = speakers.filter(speaker =>
    speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (speaker.bio && speaker.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get top speakers (most videos)
  const topSpeakers = speakers
    .filter(speaker => speaker.video_count && speaker.video_count > 0)
    .sort((a, b) => (b.video_count || 0) - (a.video_count || 0))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <VideoIcon className="h-8 w-8" />
              مركز الفيديوهات الإسلامية
            </h1>
            <Link to="/speakers">
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                جميع المتحدثين
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            مكتبة الفيديوهات الإسلامية
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            مجموعة مختارة من الفيديوهات الإسلامية النافعة من أفضل الدعاة والمتخصصين
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن فيديو أو متحدث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
        </div>

        {/* Top Speakers Section */}
        {!searchTerm && topSpeakers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                أهم الدعاة والمتحدثين
              </h3>
              <Link to="/speakers">
                <Button variant="ghost" size="sm">
                  عرض الكل
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topSpeakers.map((speaker) => (
                <Link key={speaker.id} to={`/speakers/${speaker.id}`}>
                  <Card className="text-center hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-4">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarImage src={speaker.avatar_url || ""} alt={speaker.name} />
                        <AvatarFallback className="text-sm font-semibold">
                          {speaker.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                        {speaker.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {speaker.video_count} فيديو
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <VideoIcon className="h-4 w-4" />
              الفيديوهات ({searchTerm ? filteredVideos.length : videos.length})
            </TabsTrigger>
            <TabsTrigger value="speakers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المتحدثين ({searchTerm ? filteredSpeakers.length : speakers.length})
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="w-full h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "لا توجد نتائج" : "لا توجد فيديوهات"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "حاول البحث بكلمات أخرى" : "لم يتم إضافة أي فيديوهات بعد"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <div
                      className="relative h-48 cursor-pointer"
                      onClick={() => handleWatchVideo(video.url)}
                      style={{
                        backgroundImage: video.thumbnail ? `url(${video.thumbnail})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!video.thumbnail && (
                        <div className={`h-full bg-gradient-to-br ${getColorGradient(video.color || 'blue')} flex items-center justify-center`}>
                          <Play className="h-16 w-16 text-white/80" />
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getColorGradient(video.color || 'blue')}`} />
                      
                      {/* Category badge */}
                      {video.category && (
                        <Badge variant="secondary" className="absolute top-3 right-3 bg-white/20 text-white border-white/30">
                          {video.category}
                        </Badge>
                      )}

                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="lg"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          <Play className="ml-2 h-5 w-5" />
                          مشاهدة
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {video.title}
                      </CardTitle>
                      
                      <div className="flex items-center justify-between mb-3">
                        {video.speakers && (
                          <Link 
                            to={`/speakers/${video.speakers.id}`}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={video.speakers.avatar_url || ""} alt={video.speakers.name} />
                              <AvatarFallback className="text-xs">
                                {video.speakers.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{video.speakers.name}</span>
                          </Link>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(video.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={() => handleWatchVideo(video.url)}
                      >
                        <ExternalLink className="ml-2 h-4 w-4" />
                        مشاهدة الفيديو
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Speakers Tab */}
          <TabsContent value="speakers">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 bg-muted rounded-full"></div>
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSpeakers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "لا توجد نتائج" : "لا توجد متحدثين"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "حاول البحث بكلمات أخرى" : "لم يتم إضافة أي متحدثين بعد"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSpeakers.map((speaker) => (
                  <Link key={speaker.id} to={`/speakers/${speaker.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={speaker.avatar_url || ""} alt={speaker.name} />
                            <AvatarFallback className="text-lg font-semibold">
                              {speaker.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-foreground">
                              {speaker.name}
                            </h3>
                            {speaker.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {speaker.bio}
                              </p>
                            )}
                            <Badge variant="outline">
                              {speaker.video_count || 0} فيديو
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <div className="mt-12 bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            كيفية إضافة فيديوهات ومتحدثين جديدين:
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-2">إضافة متحدث جديد:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>ادخل إلى جدول "speakers" في Supabase</li>
                <li>أضف اسم المتحدث وصورته ونبذة عنه</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">إضافة فيديو جديد:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>ادخل إلى جدول "videos" في Supabase</li>
                <li>أضف العنوان والرابط والصورة المصغرة</li>
                <li>اختر المتحدث من قائمة speaker_id</li>
                <li>أضف التصنيف واللون إذا أردت</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;