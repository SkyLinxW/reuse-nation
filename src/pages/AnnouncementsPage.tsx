import { Building2, Star, Users, Award, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AnnouncementsPageProps {
  onNavigate: (page: string) => void;
}

export const AnnouncementsPage = ({ onNavigate }: AnnouncementsPageProps) => {
  // Real partner companies data
  const partnerCompanies = [
    {
      id: 1,
      name: "Sebrae - Serviço Brasileiro de Apoio às Micro e Pequenas Empresas",
      logo: "https://logospng.org/download/sebrae/logo-sebrae-icon-256.png",
      category: "Apoio ao Empreendedorismo",
      description: "O Sebrae promove a competitividade e o desenvolvimento sustentável dos pequenos negócios, oferecendo capacitação, consultoria e acesso a mercados para empreendedores brasileiros.",
      partnership_since: "2023",
      website: "https://sebrae.com.br",
      featured: true,
      stats: {
        empresas_atendidas: "6.7M+",
        estados: 27,
        consultores: "5.000+"
      }
    },
    {
      id: 2,
      name: "SECITECI - Secretaria de Estado de Ciência, Tecnologia e Inovação",
      logo: "🔬",
      category: "Ciência e Tecnologia",
      description: "A SECITECI tem como missão elevar a capacidade científica e tecnológica em setores estratégicos para o desenvolvimento sustentável de Mato Grosso, promovendo inovação e educação tecnológica.",
      partnership_since: "2023",
      website: "https://www.secitec.mt.gov.br",
      featured: true,
      stats: {
        escolas_tecnicas: "20+",
        alunos: "15.000+",
        municipios: "50+"
      }
    },
    {
      id: 3,
      name: "Escola Estadual Dom Bosco",
      logo: "🎓",
      category: "Educação Ambiental",
      description: "Instituição de ensino comprometida com a formação integral dos alunos, incluindo educação ambiental e práticas sustentáveis, preparando cidadãos conscientes para o futuro.",
      partnership_since: "2024",
      website: "#",
      featured: true,
      stats: {
        alunos: "800+",
        projetos_ambientais: "15",
        anos_atuacao: "45+"
      }
    }
  ];

  const announcements = [
    {
      id: 1,
      title: "Parceria com Sebrae para Capacitação de Empreendedores",
      date: "10 de Janeiro, 2024",
      category: "Parceria",
      description: "Iniciamos colaboração com o Sebrae para oferecer cursos e mentorias sobre economia circular e empreendedorismo sustentável.",
      featured: true
    },
    {
      id: 2,
      title: "Projeto de Educação Ambiental com Escola Dom Bosco",
      date: "5 de Janeiro, 2024",
      category: "Educação",
      description: "Programa piloto de reciclagem e conscientização ambiental implementado em parceria com a Escola Estadual Dom Bosco.",
      featured: false
    },
    {
      id: 3,
      title: "SECITECI Apoia Inovação em Sustentabilidade",
      date: "20 de Dezembro, 2023",
      category: "Inovação",
      description: "Secretaria de Ciência e Tecnologia de MT reconhece EcoChain como plataforma inovadora para economia circular.",
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
            3 Parceiros Institucionais
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
                      <div className="text-4xl bg-eco-green/10 p-3 rounded-lg flex items-center justify-center">
                        {partner.logo.startsWith('http') ? (
                          <img src={partner.logo} alt={partner.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <span>{partner.logo}</span>
                        )}
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
                            {key === 'empresas_atendidas' && 'Empresas'}
                            {key === 'estados' && 'Estados'}
                            {key === 'consultores' && 'Consultores'}
                            {key === 'escolas_tecnicas' && 'Escolas'}
                            {key === 'alunos' && 'Alunos'}
                            {key === 'municipios' && 'Municípios'}
                            {key === 'projetos_ambientais' && 'Projetos'}
                            {key === 'anos_atuacao' && 'Anos'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {partner.website !== '#' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={() => window.open(partner.website, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visitar Site
                      </Button>
                    )}
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