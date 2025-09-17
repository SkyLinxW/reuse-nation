import { useEffect, useState } from 'react';
import { TrendingUp, Users, Recycle, Leaf, Building, Zap, Globe, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface NewsPageProps {
  onNavigate: (page: string) => void;
}

interface EcoImpactData {
  total_waste_reused: number;
  co2_saved: number;
  transactions_count: number;
  category_impact: any;
}

export const NewsPage = ({ onNavigate }: NewsPageProps) => {
  const [impactData, setImpactData] = useState<EcoImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEcoImpact = async () => {
      try {
        const { data, error } = await supabase
          .from('eco_impact')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching eco impact:', error);
        } else {
          setImpactData(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEcoImpact();
  }, []);

  // Static data for enhanced display
  const additionalStats = {
    companiesRegistered: 1247,
    indirectJobs: 3521,
    activePartnerships: 89,
    materialTypes: 156,
    monthlyGrowth: 15.2,
    successStories: 342
  };

  const categoryTranslations: Record<string, string> = {
    plasticos: 'Plásticos',
    metais: 'Metais',
    papel: 'Papel',
    madeira: 'Madeira',
    tecidos: 'Tecidos',
    eletronicos: 'Eletrônicos',
    organicos: 'Orgânicos',
    outros: 'Outros'
  };

  const stats = [
    {
      icon: Recycle,
      title: "Resíduos Reutilizados",
      value: loading ? "..." : `${(impactData?.total_waste_reused || 0).toLocaleString()} kg`,
      trend: "+18.5%",
      description: "Total de materiais desviados do descarte"
    },
    {
      icon: Leaf,
      title: "CO₂ Evitado",
      value: loading ? "..." : `${(impactData?.co2_saved || 0).toLocaleString()} kg`,
      trend: "+22.1%",
      description: "Emissões de carbono evitadas"
    },
    {
      icon: TrendingUp,
      title: "Transações Concluídas",
      value: loading ? "..." : `${(impactData?.transactions_count || 0).toLocaleString()}`,
      trend: "+31.4%",
      description: "Negócios realizados na plataforma"
    },
    {
      icon: Building,
      title: "Empresas Cadastradas",
      value: `${additionalStats.companiesRegistered.toLocaleString()}`,
      trend: `+${additionalStats.monthlyGrowth}%`,
      description: "Empresas ativas na plataforma"
    },
    {
      icon: Users,
      title: "Empregos Indiretos",
      value: `${additionalStats.indirectJobs.toLocaleString()}`,
      trend: "+12.3%",
      description: "Postos de trabalho gerados"
    },
    {
      icon: Globe,
      title: "Parcerias Ativas",
      value: `${additionalStats.activePartnerships}`,
      trend: "+8.7%",
      description: "Empresas parceiras certificadas"
    },
    {
      icon: Zap,
      title: "Tipos de Materiais",
      value: `${additionalStats.materialTypes}`,
      trend: "+5.2%",
      description: "Categorias diferentes de resíduos"
    },
    {
      icon: Award,
      title: "Casos de Sucesso",
      value: `${additionalStats.successStories}`,
      trend: "+25.8%",
      description: "Histórias de transformação"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-eco text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Impacto em Tempo Real
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Acompanhe como estamos transformando o futuro da sustentabilidade empresarial
          </p>
          <Badge variant="secondary" className="bg-white text-eco-green px-4 py-2 text-lg">
            Dados Atualizados em Tempo Real
          </Badge>
        </div>
      </section>

      {/* Main Statistics */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-eco-green mb-6">
              Nossos Números
            </h2>
            <p className="text-lg text-muted-foreground">
              Métricas que mostram o impacto real da EcoChain no meio ambiente e economia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-eco-green/20 hover:shadow-eco transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-8 w-8 text-eco-green group-hover:scale-110 transition-transform" />
                    <Badge variant="secondary" className="text-xs bg-eco-green/10 text-eco-green">
                      {stat.trend}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-eco-green mb-1">
                    {stat.value}
                  </div>
                  <div className="font-medium text-sm mb-2">
                    {stat.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      {impactData?.category_impact && (
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-eco-green mb-6">
                Impacto por Categoria
              </h2>
              <p className="text-lg text-muted-foreground">
                Distribuição dos materiais processados por tipo
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(impactData.category_impact).map(([category, amount]) => (
                <Card key={category} className="text-center border-eco-green/20">
                  <CardContent className="pt-6">
                    <div className="text-xl font-bold text-eco-green mb-2">
                      {Number(amount).toLocaleString()} kg
                    </div>
                    <div className="text-sm font-medium">
                      {categoryTranslations[category] || category}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Growth Projections */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-eco-green mb-6">
              Projeções de Crescimento
            </h2>
            <p className="text-lg text-muted-foreground">
              Metas e expectativas para os próximos anos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-eco-green/20">
              <CardHeader>
                <CardTitle className="text-eco-green">2024</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-eco-green mb-2">2.5M kg</div>
                <p className="text-sm text-muted-foreground">Resíduos processados</p>
                <div className="text-2xl font-bold text-eco-green mb-2 mt-4">500</div>
                <p className="text-sm text-muted-foreground">Empresas parceiras</p>
              </CardContent>
            </Card>

            <Card className="text-center border-eco-green/20 bg-eco-green/5">
              <CardHeader>
                <CardTitle className="text-eco-green">2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-eco-green mb-2">5M kg</div>
                <p className="text-sm text-muted-foreground">Resíduos processados</p>
                <div className="text-2xl font-bold text-eco-green mb-2 mt-4">1.000</div>
                <p className="text-sm text-muted-foreground">Empresas parceiras</p>
              </CardContent>
            </Card>

            <Card className="text-center border-eco-green/20">
              <CardHeader>
                <CardTitle className="text-eco-green">2026</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-eco-green mb-2">10M kg</div>
                <p className="text-sm text-muted-foreground">Resíduos processados</p>
                <div className="text-2xl font-bold text-eco-green mb-2 mt-4">2.000</div>
                <p className="text-sm text-muted-foreground">Empresas parceiras</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-eco-green">
            Faça Parte desta Transformação
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se às empresas que já estão contribuindo para estes números 
            e construindo um futuro mais sustentável.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigate('auth')}
              size="lg"
              className="bg-gradient-eco hover:opacity-90"
            >
              Cadastrar Empresa
            </Button>
            <Button 
              onClick={() => onNavigate('services')}
              variant="outline" 
              size="lg"
            >
              Conhecer Serviços
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};