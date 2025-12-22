import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ShopifyProduct[]>([]);
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchProducts(3);
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error loading featured products:', error);
      }
    };
    loadProducts();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Banner - Full Width Split Design */}
      <section className="relative h-[85vh] min-h-[600px] max-h-[900px]">
        <div className="grid md:grid-cols-2 h-full">
          {/* Left Hero */}
          <div className="relative bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=2070')] bg-cover bg-center opacity-30 transition-transform duration-700 group-hover:scale-105"></div>
            <div className="relative z-20 text-center px-8 py-12">
              <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">SIGNATURE</h2>
              <p className="text-xl md:text-2xl font-light mb-6 tracking-wider">COLLECTION</p>
              <Link to="/products">
                <Button size="lg" className="gap-2 shadow-lg">
                  Explore Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right Hero */}
          <div className="relative bg-gradient-to-br from-accent/5 to-primary/10 flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=2070')] bg-cover bg-center opacity-30 transition-transform duration-700 group-hover:scale-105"></div>
            <div className="relative z-20 text-center px-8 py-12">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">NEW</h2>
              <p className="text-2xl md:text-3xl font-light mb-2 tracking-wider">ARRIVALS</p>
              <p className="text-sm md:text-base text-muted-foreground mb-6 tracking-wide">FRESH. BOLD. YOURS.</p>
              <Link to="/products">
                <Button variant="outline" size="lg" className="gap-2 bg-background/50 backdrop-blur-sm border-2 hover:bg-background">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Centered Brand Logo */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent opacity-20">
            VERSE
          </h1>
        </div>
      </section>


      {/* Featured Products Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <p className="text-sm tracking-[0.3em] text-muted-foreground mb-2 uppercase">Discover</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Featured Collection</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent"></div>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <Link 
                  key={product.node.id} 
                  to={`/product/${product.node.handle}`} 
                  className="group block"
                >
                  <div className="relative overflow-hidden bg-card rounded-sm border border-border/30 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl">
                    <div className="aspect-[3/4] overflow-hidden bg-secondary/10 relative">
                      {product.node.images.edges[0] ? (
                        <>
                          <img
                            src={product.node.images.edges[0].node.url}
                            alt={product.node.images.edges[0].node.altText || product.node.title}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                      
                      {/* Quick View Overlay */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <div className="bg-background/95 backdrop-blur-sm px-6 py-2 rounded-full border border-border">
                          <span className="text-sm font-medium">View Details</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg mb-2 tracking-tight group-hover:text-primary transition-colors">
                        {product.node.title}
                      </h3>
                      <p className="text-lg font-bold">
                        {product.node.priceRange.minVariantPrice.currencyCode === 'USD' ? '$' : '₹'}
                        {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-6">No products found</p>
              <p className="text-sm text-muted-foreground">Create your first product to get started</p>
            </div>
          )}
          
          {featuredProducts.length > 0 && (
            <div className="text-center mt-16">
              <Link to="/products">
                <Button variant="outline" size="lg" className="border-2">
                  View All Products
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Brand Philosophy Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center md:text-left">
              <p className="text-sm tracking-[0.3em] text-primary mb-4 uppercase font-medium">Our Philosophy</p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                Every Shirt<br />A Verse
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent mb-6 mx-auto md:mx-0"></div>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                At Verse, we believe in creating shirts that transcend trends. Each piece is thoughtfully 
                designed with premium materials and meticulous attention to detail.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                From classic whites to bold patterns, every shirt tells its own story. Quality that lasts, 
                style that speaks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
