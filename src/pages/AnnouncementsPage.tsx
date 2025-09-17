import { Building2, Star, Users, Award, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AnnouncementsPageProps {
  onNavigate: (page: string) => void;
}

export const AnnouncementsPage = ({ onNavigate }: AnnouncementsPageProps) => {
  // Sample partner companies data - in a real app, this would come from a database
  const partnerCompanies = [
    {
      id: 1,
      name: "GreenTech Recycling",
      logo: "🔄", // In real implementation, use actual logo URLs
      category: "Reciclagem Avançada",
      description: "Especializada em processamento de resíduos eletrônicos e plásticos de alta tecnologia.",
      partnership_since: "2022",
      website: "https://greentech-recycling.com",
      featured: true,
      stats: {
        materials_processed: "2.5M kg",
        locations: 12,
        employees: 450
      }
    },
    {
      id: 2,
      name: "EcoSolutions Brasil",
      logo: "🌱",
      category: "Consultoria Ambiental",
      description: "Consultoria especializada em implementação de programas de sustentabilidade empresarial.",
      partnership_since: "2021",
      website: "https://ecosolutions.com.br",
      featured: true,
      stats: {
        projects_completed: "180+",
        locations: 8,
        employees: 120
      }
    },
    {
      id: 3,
      name: "Logística Verde",
      logo: "🚛",
      category: "Transporte Sustentável",
      description: "Rede nacional de transporte especializada em coleta e distribuição de materiais recicláveis.",
      partnership_since: "2023",
      website: "https://logisticaverde.com",
      featured: false,
      stats: {
        routes_covered: "50+ cidades",
        fleet_size: 85,
        employees: 200
      }
    },
    {
      id: 4,
      name: "Metal Renova",
      logo: "⚙️",
      category: "Processamento de Metais",
      description: "Líder em reciclagem e processamento de metais ferrosos e não-ferrosos no Brasil.",
      partnership_since: "2020",
      website: "https://metalrenova.com.br",
      featured: true,
      stats: {
        capacity: "10K ton/mês",
        locations: 15,
        employees: 680
      }
    },
    {
      id: 5,
      name: "BioWaste Solutions",
      logo: "🍃",
      category: "Resíduos Orgânicos",
      description: "Especialista em transformação de resíduos orgânicos em biogás e fertilizantes.",
      partnership_since: "2022",
      website: "https://biowaste.com.br",
      featured: false,
      stats: {
        biogas_produced: "2.8M m³",
        facilities: 6,
        employees: 95
      }
    },
    {
      id: 6,
      name: "Paper Cycle",
      logo: "📄",
      category: "Reciclagem de Papel",
      description: "Processamento completo de papel e papelão, do descarte até produtos finais.",
      partnership_since: "2021",
      website: "https://papercycle.com.br",
      featured: false,
      stats: {
        paper_processed: "1.2M kg",
        locations: 5,
        employees: 150
      }
    }
  ];

  const announcements = [
    {
      id: 1,
      title: "Nova Parceria com GreenTech Recycling",
      date: "15 de Janeiro, 2024",
      category: "Parceria",
      description: "Expandimos nossa rede com uma das maiores empresas de reciclagem tecnológica do país.",
      featured: true
    },
    {
      id: 2,
      title: "Certificação ISO 14001 Renovada",
      date: "8 de Janeiro, 2024",
      category: "Certificação",
      description: "EcoChain mantém seu compromisso com os mais altos padrões de gestão ambiental.",
      featured: false
    },
    {
      id: 3,
      title: "Expansão para Região Sul",
      date: "22 de Dezembro, 2023",
      category: "Expansão",
      description: "Novos parceiros e cobertura em Santa Catarina, Paraná e Rio Grande do Sul.",
      featured: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-eco text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Anúncios e Parcerias
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Conheça nossa rede de empresas parceiras e as últimas novidades da EcoChain
          </p>
          <Badge variant="secondary" className="bg-white text-eco-green px-4 py-2 text-lg">
            Rede com 200+ Empresas Parceiras
          </Badge>
        </div>
      </section>

      {/* Recent Announcements */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-eco-green mb-6">
              Últimos Anúncios
            </h2>
            <p className="text-lg text-muted-foreground">
              Fique por dentro das novidades e desenvolvimentos da EcoChain
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className={`border-eco-green/20 hover:shadow-eco transition-all duration-300 ${announcement.featured ? 'ring-2 ring-eco-green/20' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={announcement.featured ? "default" : "secondary"} className={announcement.featured ? "bg-eco-green" : ""}>
                      {announcement.category}
                    </Badge>
                    {announcement.featured && <Star className="h-5 w-5 text-eco-green" />}
                  </div>
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <CardDescription>{announcement.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{announcement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Companies Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-eco-green mb-6">
              Empresas Parceiras
            </h2>
            <p className="text-lg text-muted-foreground">
              Conheça as empresas que fazem parte da nossa rede de sustentabilidade
            </p>
          </div>

          {/* Featured Partners */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-eco-green mb-8 text-center">
              Parceiros em Destaque
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {partnerCompanies.filter(partner => partner.featured).map((partner) => (
                <Card key={partner.id} className="border-eco-green/20 hover:shadow-eco transition-all duration-300 bg-gradient-to-br from-card to-eco-green/5">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl bg-eco-green/10 p-3 rounded-lg">
                        {partner.logo}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-eco-green">
                          {partner.name}
                        </CardTitle>
                        <CardDescription className="font-medium">
                          {partner.category}
                        </CardDescription>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Parceiros desde {partner.partnership_since}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {partner.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      {Object.entries(partner.stats).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-lg font-bold text-eco-green">{value}</div>
                          <div className="text-xs text-muted-foreground">
                            {key === 'materials_processed' && 'Materiais'}
                            {key === 'locations' && 'Locais'}
                            {key === 'employees' && 'Funcionários'}
                            {key === 'projects_completed' && 'Projetos'}
                            {key === 'routes_covered' && 'Rotas'}
                            {key === 'fleet_size' && 'Frota'}
                            {key === 'capacity' && 'Capacidade'}
                            {key === 'biogas_produced' && 'Biogás'}
                            {key === 'facilities' && 'Instalações'}
                            {key === 'paper_processed' && 'Papel'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visitar Site
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Partners Grid */}
          <div>
            <h3 className="text-2xl font-bold text-eco-green mb-8 text-center">
              Todos os Parceiros
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {partnerCompanies.map((partner) => (
                <Card key={partner.id} className="border-eco-green/20 hover:shadow-eco transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl bg-eco-green/10 p-2 rounded">
                        {partner.logo}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-eco-green">
                          {partner.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {partner.category}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {partner.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        Desde {partner.partnership_since}
                      </Badge>
                      {partner.featured && (
                        <Badge className="bg-eco-green text-xs">
                          Destaque
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Opportunities */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-eco-green">
            Torne-se um Parceiro
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se à nossa rede de empresas comprometidas com a sustentabilidade 
            e expanda seus negócios de forma responsável.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center">
              <Building2 className="h-12 w-12 text-eco-green mb-4" />
              <h3 className="font-bold mb-2">Visibilidade</h3>
              <p className="text-sm text-muted-foreground">
                Destaque sua empresa em nossa plataforma
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-eco-green mb-4" />
              <h3 className="font-bold mb-2">Networking</h3>
              <p className="text-sm text-muted-foreground">
                Conecte-se com empresas do setor
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-12 w-12 text-eco-green mb-4" />
              <h3 className="font-bold mb-2">Certificação</h3>
              <p className="text-sm text-muted-foreground">
                Reconhecimento em sustentabilidade
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigate('auth')}
              size="lg"
              className="bg-gradient-eco hover:opacity-90"
            >
              Candidatar-se como Parceiro
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => onNavigate('services')}
              variant="outline" 
              size="lg"
            >
              Conhecer Benefícios
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};