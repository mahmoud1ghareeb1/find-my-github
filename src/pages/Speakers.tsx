import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface Speaker {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  video_count?: number;
}

const Speakers = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchSpeakers = async () => {
    try {
      setLoading(true);
      
      // Fetch speakers with video count
      const { data: speakersData, error } = await supabase
        .from('speakers')
        .select(`
          *,
          videos(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data to get video count
      const processedSpeakers = speakersData?.map(speaker => ({
        ...speaker,
        video_count: speaker.videos?.[0]?.count || 0
      })) || [];

      setSpeakers(processedSpeakers);
    } catch (error) {
      console.error('Error fetching speakers:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المتحدثين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const filteredSpeakers = speakers.filter(speaker =>
    speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (speaker.bio && speaker.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              مركز الفيديوهات الإسلامية
            </Link>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              الدعاة والمتحدثين
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">الدعاة والمتحدثين</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            تعرف على الدعاة والمتحدثين الذين يقدمون المحتوى الإسلامي المتميز
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن داعية أو متحدث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Speakers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
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

        {/* Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-muted/50 rounded-lg px-6 py-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{speakers.length}</div>
              <div className="text-sm text-muted-foreground">متحدث</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {speakers.reduce((total, speaker) => total + (speaker.video_count || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">فيديو</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Speakers;