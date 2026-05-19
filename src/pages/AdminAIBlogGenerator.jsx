import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowLeft, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MAX_DAILY_ARTICLES = 3;

export default function AdminAIBlogGenerator() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("tipy");
  const [keyword, setKeyword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState("");

  // Získame všetky články z databázy a vyfiltrujeme dnešné, aby sme zistili limit
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['all-blog-posts-for-limit'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 50),
    initialData: []
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const postsGeneratedToday = posts.filter(post => {
    if (!post.created_date) return false;
    return post.created_date.split('T')[0] === todayStr;
  });

  const limitReached = postsGeneratedToday.length >= MAX_DAILY_ARTICLES;

  const generateBlogMutation = useMutation({
    mutationFn: async () => {
      setProgressText("1/3 Píšem obsah (môže to trvať 20-30 sekúnd)...");
      
      const systemPrompt = `
      Si Senior SEO Copywriter a expert na tému drevodomov, montovaných domov a mobilných domov. 
      Tvojou úlohou je napísať rozsiahly (aspoň 1000 slov), pútavý a odborne správny článok.
      Píš v slovenskom jazyku. Používaj moderný, presvedčivý a dôveryhodný tón (značka: American Living).
      
      Formát vrátených dát MUSÍ BYŤ PLATNÝ JSON OBJEKT obsahujúci nasledovné kľúče:
      - "nazov": Príťažlivý a clickbait SEO nadpis.
      - "slug": url-friendly-nazov-clanku
      - "perex": Krátky úvodný odsek (2 vety), ktorý zaujme.
      - "obsah": Samotný obsah článku vo formáte Markdown. Používaj H2 a H3 nadpisy, odrážky, a zvýraznenia dôležitých slov.
      - "meta_title": SEO titulok (max 60 znakov).
      - "meta_description": SEO popis (max 160 znakov).
      - "tagy": Pole stringov (3-5 tagov), napr. ["montované domy", "cena", "stavebné povolenie"].
      
      NEVRACAJ ŽIADEN INÝ TEXT ANI MARKDOWN BLOKY (\`\`\`json), LEN ČISTÝ VALIDNÝ JSON.
      `;

      const prompt = `Vygeneruj mi SEO článok na tému: "${topic}". Hlavné kľúčové slovo, na ktoré chcem cieliť je: "${keyword}". Kategória je: ${category}. Daj si záležať na kvalite, používaj odrážky a H2/H3 nadpisy.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        system_prompt: systemPrompt
      });

      if (!response || !response.response) {
        throw new Error("AI nevrátila žiadnu odpoveď.");
      }

      let parsedData;
      try {
        let jsonStr = response.response;
        // Ochrana pred prípadným markdownom v odpovedi
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');
        }
        parsedData = JSON.parse(jsonStr.trim());
      } catch (err) {
        console.error("Chyba pri parsovaní JSON:", response.response);
        throw new Error("AI nevrátila validný formát JSON. Skúste znova.");
      }

      setProgressText("2/3 Ukladám do databázy...");
      
      const newPostData = {
        nazov: parsedData.nazov,
        slug: parsedData.slug,
        perex: parsedData.perex,
        obsah: parsedData.obsah,
        meta_title: parsedData.meta_title,
        meta_description: parsedData.meta_description,
        tagy: parsedData.tagy || [],
        kategoria: category,
        autor: "American Living AI",
        publikovany: false,
        titulny_obrazok: "https://cloud.base44.com/storage/v1/object/public/uploads/americanliving-sk/images/07d853b0-6815-4fa8-b21a-e6a2eb68095d.webp" // Default image
      };

      const createdPost = await base44.entities.BlogPost.create(newPostData);
      
      setProgressText("3/3 Generujem titulný AI obrázok...");
      try {
        await base44.functions.invoke('generateBlogImage', { postId: createdPost.id });
      } catch (imgError) {
        console.error("Obrázok sa nevygeneroval, ale článok je uložený:", imgError);
        // Nevyhadzujeme chybu, článok je úspešný
      }

      return createdPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts-for-limit'] });
      setIsGenerating(false);
      setProgressText("");
      setTopic("");
      setKeyword("");
      toast.success("Článok bol úspešne vygenerovaný a uložený do konceptov!");
      navigate(createPageUrl("AdminBlog"));
    },
    onError: (error) => {
      setIsGenerating(false);
      setProgressText("");
      toast.error(error.message || "Nastala chyba pri generovaní článku.");
    }
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    if (limitReached) {
      toast.error("Dosiahli ste denný limit.");
      return;
    }
    if (!topic || !keyword) {
      toast.error("Vyplňte tému aj kľúčové slovo.");
      return;
    }
    setIsGenerating(true);
    generateBlogMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to={createPageUrl("AdminBlog")}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              AI Generátor Článkov
            </h1>
            <p className="text-gray-600">
              Zadajte tému a systém napíše 1500+ slovný SEO článok a sám ho uloží do blogu.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <Label htmlFor="topic" className="text-lg font-semibold">Téma článku (O čom to bude?)</Label>
                  <p className="text-sm text-gray-500 mb-2">Napríklad: "Prečo sa netreba báť vlhkosti v montovaných drevodomoch"</p>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Sem napíšte tému..."
                    disabled={isGenerating || limitReached}
                    required
                    className="h-12 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="keyword" className="text-lg font-semibold">Hlavné SEO kľúčové slovo</Label>
                  <p className="text-sm text-gray-500 mb-2">Napríklad: "Montované domy na kľúč"</p>
                  <Input
                    id="keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Hlavné slovo pre Google..."
                    disabled={isGenerating || limitReached}
                    required
                    className="h-12 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-lg font-semibold">Kategória blogu</Label>
                  <Select value={category} onValueChange={setCategory} disabled={isGenerating || limitReached}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tipy">Tipy a rady</SelectItem>
                      <SelectItem value="novinky">Novinky</SelectItem>
                      <SelectItem value="technologie">Technológie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    disabled={isGenerating || limitReached || !topic || !keyword}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {progressText || "Generujem..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Vygenerovať článok s AI
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-slate-900 text-white shadow-xl">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Ochrana kreditov
              </h3>
              <p className="text-slate-300 mb-4 text-sm">
                Aby sa zabránilo náhodnému vyčerpaniu integračných kreditov z Base44, systém povoľuje vygenerovať maximálne {MAX_DAILY_ARTICLES} články denne.
              </p>
              
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Dnes vygenerované:</p>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-bold ${limitReached ? 'text-red-500' : 'text-green-500'}`}>
                    {postsGeneratedToday.length}
                  </span>
                  <span className="text-slate-500 mb-1">/ {MAX_DAILY_ARTICLES}</span>
                </div>
                
                {limitReached && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                    Pre dnešok ste vyčerpali limit. Ďalšie články bude možné vygenerovať zajtra.
                  </motion.div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Ako to funguje?</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Vy zadáte len 2 slová. AI sa postará o zvyšok.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Systém napíše 1500 slov, pridá odrážky, nadpisy a zhrnutie.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Automaticky sa vygeneruje SEO názov aj meta popis.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Článok sa uloží ako Koncept, vy si ho len skontrolujete a publikujete.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
