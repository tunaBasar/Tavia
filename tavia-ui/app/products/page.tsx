"use client";

import { useState, useMemo } from "react";
import {
  Coffee,
  Loader2,
  AlertCircle,
  Search,
  Beaker,
  ChevronRight,
  FlaskConical,
  X,
  Droplets,
  Scale,
  Box,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useProducts } from "@/lib/hooks/use-products";
import { useCreateProduct } from "@/lib/hooks/use-create-product";
import { useInventory } from "@/lib/hooks/use-inventory";
import type { Product, ProductCategory, UnitType, CreateRecipeIngredientRequest } from "@/types";

// ─── Domain Helpers ──────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  ProductCategory,
  { label: string; gradient: string; icon: string }
> = {
  ESPRESSO_BASED: {
    label: "Espresso",
    gradient: "from-amber-600 via-orange-700 to-yellow-800",
    icon: "☕",
  },
  TEA: {
    label: "Tea",
    gradient: "from-emerald-500 via-green-600 to-teal-500",
    icon: "🍵",
  },
  COLD_BEVERAGE: {
    label: "Cold Beverage",
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    icon: "🧊",
  },
  FOOD: {
    label: "Food",
    gradient: "from-orange-400 via-red-500 to-rose-500",
    icon: "🍞",
  },
  DESSERT: {
    label: "Dessert",
    gradient: "from-pink-400 via-fuchsia-500 to-purple-500",
    icon: "🍰",
  },
};

function getCategoryConfig(category: ProductCategory) {
  return CATEGORY_CONFIG[category] ?? { label: category, gradient: "from-gray-400 to-gray-500", icon: "📦" };
}

function formatUnit(unit: UnitType): string {
  const labels: Record<UnitType, string> = {
    MILLILITER: "mL",
    GRAM: "g",
    PIECE: "pc",
  };
  return labels[unit] ?? unit;
}

function getUnitIcon(unit: UnitType) {
  switch (unit) {
    case "MILLILITER":
      return Droplets;
    case "GRAM":
      return Scale;
    case "PIECE":
      return Box;
    default:
      return Box;
  }
}

// ─── Main Page Component ─────────────────────────────────────────

const EMPTY_INGREDIENT: CreateRecipeIngredientRequest = {
  rawMaterialName: "",
  quantity: 0,
  unit: "GRAM",
};

export default function ProductsPage() {
  const { data, isLoading, isError, error } = useProducts();
  const { data: inventoryData } = useInventory();
  const inventoryItems = inventoryData?.data ?? [];
  const createMutation = useCreateProduct();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "ALL">("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // ─── Create form state ──────────────────────────────────────────
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formCategory, setFormCategory] = useState<ProductCategory>("ESPRESSO_BASED");
  const [formDescription, setFormDescription] = useState("");
  const [formIngredients, setFormIngredients] = useState<CreateRecipeIngredientRequest[]>([
    { ...EMPTY_INGREDIENT },
  ]);

  function resetForm() {
    setFormDisplayName("");
    setFormCategory("ESPRESSO_BASED");
    setFormDescription("");
    setFormIngredients([{ ...EMPTY_INGREDIENT }]);
  }

  function addIngredient() {
    setFormIngredients((prev) => [...prev, { ...EMPTY_INGREDIENT }]);
  }

  function removeIngredient(idx: number) {
    setFormIngredients((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateIngredient(idx: number, field: keyof CreateRecipeIngredientRequest, value: string | number) {
    setFormIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  }

  function onCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = formDisplayName.trim();
    if (!trimmedName) {
      toast.error("Product name is required.");
      return;
    }
    const validIngredients = formIngredients.filter((ing) => ing.rawMaterialName.trim() && ing.quantity > 0);
    if (validIngredients.length === 0) {
      toast.error("At least one ingredient with a valid name and quantity is required.");
      return;
    }

    createMutation.mutate(
      {
        productName: trimmedName.toUpperCase().replace(/\s+/g, "_"),
        displayName: trimmedName,
        category: formCategory,
        description: formDescription.trim() || undefined,
        active: true,
        ingredients: validIngredients.map((ing) => ({
          rawMaterialName: ing.rawMaterialName.trim(),
          quantity: Number(ing.quantity),
          unit: ing.unit,
        })),
      },
      {
        onSuccess: () => {
          toast.success("Product created successfully");
          setIsCreateOpen(false);
          resetForm();
        },
        onError: (err) => {
          toast.error("Failed to create product", {
            description: err instanceof Error ? err.message : "Unknown error",
          });
        },
      }
    );
  }

  const products = data?.data ?? [];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "ALL" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Stats
  const activeCount = products.filter((p) => p.active).length;
  const inactiveCount = products.filter((p) => !p.active).length;
  const categoryBreakdown = useMemo(() => {
    const counts: Partial<Record<ProductCategory, number>> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, [products]);

  // Unique categories present in data — for the filter
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product catalog &amp; recipes (Bill of Materials)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && !isError && (
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2">
              <Coffee className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {products.length}
              </span>
              <span className="text-sm text-muted-foreground">products</span>
            </div>
          )}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger render={
              <Button>
                <Plus className="mr-2 size-4" />
                Add Product
              </Button>
            } />
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Define a product and its recipe (Bill of Materials).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onCreateSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Product Name</Label>
                  <Input
                    id="displayName"
                    placeholder="e.g. Caramel Latte"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formCategory}
                    onValueChange={(val) => val && setFormCategory(val as ProductCategory)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ESPRESSO_BASED">Espresso Based</SelectItem>
                      <SelectItem value="TEA">Tea</SelectItem>
                      <SelectItem value="COLD_BEVERAGE">Cold Beverage</SelectItem>
                      <SelectItem value="FOOD">Food</SelectItem>
                      <SelectItem value="DESSERT">Dessert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Short product description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Ingredients (BOM)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                      <Plus className="mr-1 size-3" /> Add
                    </Button>
                  </div>
                  {formIngredients.map((ing, idx) => (
                    <div key={idx} className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        {idx === 0 && <span className="text-xs text-muted-foreground">Material</span>}
                        <Select
                          value={ing.rawMaterialName}
                          onValueChange={(val) => updateIngredient(idx, "rawMaterialName", val || "")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.name}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20 space-y-1">
                        {idx === 0 && <span className="text-xs text-muted-foreground">Qty</span>}
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          placeholder="0"
                          value={ing.quantity || ""}
                          onChange={(e) => updateIngredient(idx, "quantity", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-28 space-y-1">
                        {idx === 0 && <span className="text-xs text-muted-foreground">Unit</span>}
                        <Select
                          value={ing.unit}
                          onValueChange={(val) => val && updateIngredient(idx, "unit", val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GRAM">Gram</SelectItem>
                            <SelectItem value="MILLILITER">mL</SelectItem>
                            <SelectItem value="PIECE">Piece</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeIngredient(idx)}
                        disabled={formIngredients.length <= 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Create Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">
            Loading product catalog...
          </span>
        </div>
      ) : isError ? (
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 py-8">
            <AlertCircle className="size-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Failed to load products
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Coffee className="size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No products in your catalog yet.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Products will appear here when added via the Catalog API.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total Products"
              value={products.length.toString()}
              gradient="from-blue-500 via-cyan-500 to-teal-500"
            />
            <SummaryCard
              label="Active"
              value={activeCount.toString()}
              gradient="from-emerald-500 via-green-500 to-teal-500"
            />
            <SummaryCard
              label="Inactive"
              value={inactiveCount.toString()}
              gradient="from-amber-500 via-orange-500 to-red-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="product-search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                id="filter-all"
                variant={categoryFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("ALL")}
              >
                All
              </Button>
              {availableCategories.map((cat) => {
                const config = getCategoryConfig(cat);
                return (
                  <Button
                    id={`filter-${cat.toLowerCase()}`}
                    key={cat}
                    variant={categoryFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                  >
                    <span className="mr-1">{config.icon}</span>
                    {config.label}
                    {categoryBreakdown[cat] != null && (
                      <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 text-[10px] font-bold">
                        {categoryBreakdown[cat]}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Search className="size-8 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No products match your search.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Product Detail Sheet */}
      <Sheet
        open={selectedProduct !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedProduct && (
            <ProductDetailSheet
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────

function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: () => void;
}) {
  const config = getCategoryConfig(product.category);

  return (
    <Card
      id={`product-card-${product.id}`}
      className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      onClick={onSelect}
    >
      {/* Category gradient accent */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.gradient} opacity-60 transition-opacity group-hover:opacity-100`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-lg">
              {config.icon}
            </div>
            <div>
              <CardTitle className="text-base font-semibold leading-tight">
                {product.displayName}
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {config.label}
              </p>
            </div>
          </div>
          <Badge variant={product.active ? "default" : "secondary"}>
            {product.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        {/* Ingredient preview */}
        <div className="flex items-center gap-2">
          <FlaskConical className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {product.ingredients.length} ingredient{product.ingredients.length !== 1 ? "s" : ""}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="truncate text-xs text-muted-foreground/70">
            {product.ingredients
              .slice(0, 3)
              .map((i) => i.rawMaterialName)
              .join(", ")}
            {product.ingredients.length > 3 && "…"}
          </span>
        </div>

        {/* View detail hint */}
        <div className="flex items-center justify-end gap-1 text-xs font-medium text-primary/70 transition-colors group-hover:text-primary">
          View Recipe
          <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Product Detail Sheet ────────────────────────────────────────

function ProductDetailSheet({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const config = getCategoryConfig(product.category);

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="space-y-4 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} text-xl shadow-lg`}
            >
              <span className="drop-shadow-md">{config.icon}</span>
            </div>
            <div>
              <SheetTitle className="text-lg font-bold">
                {product.displayName}
              </SheetTitle>
              <SheetDescription className="text-sm">
                {config.label} · {product.active ? "Active" : "Inactive"}
              </SheetDescription>
            </div>
          </div>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={product.active ? "default" : "secondary"}>
            {product.active ? "✓ Active" : "⏸ Inactive"}
          </Badge>
          <Badge variant="outline">{config.label}</Badge>
          <Badge variant="outline" className="font-mono text-[10px]">
            {product.productName}
          </Badge>
        </div>
      </SheetHeader>

      <Separator />

      {/* BOM / Ingredients */}
      <div className="flex-1 py-6">
        <div className="mb-4 flex items-center gap-2">
          <Beaker className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Bill of Materials
          </h3>
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {product.ingredients.length} ingredient{product.ingredients.length !== 1 ? "s" : ""}
          </span>
        </div>

        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="space-y-3 pr-3">
            {product.ingredients.map((ingredient, idx) => {
              const UnitIcon = getUnitIcon(ingredient.unit);
              return (
                <div
                  key={ingredient.id}
                  className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
                >
                  {/* Index indicator */}
                  <div className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                      <UnitIcon className="size-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {ingredient.rawMaterialName}
                      </p>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-lg font-bold tabular-nums text-foreground">
                          {ingredient.quantity.toLocaleString("tr-TR", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {formatUnit(ingredient.unit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {product.ingredients.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Layers className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No ingredients defined for this product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Summary Card helper ─────────────────────────────────────────

function SummaryCard({
  label,
  value,
  gradient,
}: {
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
      <div
        className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`}
      />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
