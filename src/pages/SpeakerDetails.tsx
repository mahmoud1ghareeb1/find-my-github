import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, Search, Calendar, ExternalLink } from "lucide-react";

interface Speaker {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Video {
  id: number;
  title: string;
  url: string;
  thumbnail: string | null;
  category: string | null;
  color: string | null;
  created_at: string;
  speaker: Speaker | null;
}

const SpeakerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchSpeakerData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Fetch speaker details
      const { data: speakerData, error: speakerError } = await supabase
        .from('speakers')
        .select('*')
        .eq('id', id)
        .single();

      if (speakerError) throw speakerError;
      
      // Fetch speaker's videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          *,
          speakers(*)
        `)
        .eq('speaker_id', id)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      // Transform the data to match our Video interface
      const transformedVideos = videosData?.map(video => ({
        ...video,
        speaker: video.speakers
      })) || [];

      setSpeaker(speakerData);
      setVideos(transformedVideos);
    } catch (error) {
      console.error('Error fetching speaker data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المتحدث",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakerData();
  }, [id]);

  const handleWatchVideo = (url: string) => {
    window.open(url, '_blank');
  };

  const getColorGradient = (color: string | null) => {
    const gradients: { [key: string]: string } = {
      blue: "from-blue-500/20 to-blue-600/20",
      green: "from-green-500/20 to-green-600/20",
      purple: "from-purple-500/20 to-purple-600/20",
      red: "from-red-500/20 to-red-600/20",
      orange: "from-orange-500/20 to-orange-600/20",
      teal: "from-teal-500/20 to-teal-600/20",
    };
    return gradients[color || 'blue'] || gradients.blue;
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (video.category && video.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <header className="bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-64" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!speaker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">المتحدث غير موجود</h2>
          <Link to="/speakers">
            <Button variant="outline">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للمتحدثين
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              مركز الفيديوهات الإسلامية
            </Link>
            <Link to="/speakers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة للمتحدثين
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Speaker Profile */}
        <div className="text-center mb-12">
          <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-primary/20">
            <AvatarImage src={speaker.avatar_url || ""} alt={speaker.name} />
            <AvatarFallback className="text-3xl font-bold">
              {speaker.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">{speaker.name}</h1>
          
          {speaker.bio && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              {speaker.bio}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              انضم في {new Date(speaker.created_at).toLocaleDateString('ar-EG')}
            </div>
            <Badge variant="secondary">
              {videos.length} فيديو
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث في فيديوهات المتحدث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? "لا توجد نتائج" : "لا توجد فيديوهات"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? "حاول البحث بكلمات أخرى" : "لم يتم نشر أي فيديوهات من هذا المتحدث بعد"}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              فيديوهات {speaker.name} ({filteredVideos.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="p-0">
                    <div 
                      className={`aspect-video bg-gradient-to-br ${getColorGradient(video.color)} flex items-center justify-center relative overflow-hidden`}
                      style={{
                        backgroundImage: video.thumbnail ? `url(${video.thumbnail})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!video.thumbnail && (
                        <Play className="h-16 w-16 text-white/80" />
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getColorGradient(video.color)}`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="lg"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          onClick={() => handleWatchVideo(video.url)}
                        >
                          <Play className="ml-2 h-5 w-5" />
                          مشاهدة
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {video.title}
                    </CardTitle>
                    
                    <div className="flex items-center justify-between">
                      {video.category && (
                        <Badge variant="outline" className="text-xs">
                          {video.category}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(video.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full" 
                      onClick={() => handleWatchVideo(video.url)}
                    >
                      <ExternalLink className="ml-2 h-4 w-4" />
                      مشاهدة الفيديو
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SpeakerDetails;