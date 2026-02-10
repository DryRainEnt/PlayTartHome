import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit, Eye } from "lucide-react"

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*, category:product_categories(name)")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">제품 관리</h1>
          <p className="text-muted-foreground">디지털 제품을 추가, 수정, 삭제할 수 있습니다</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            새 제품 추가
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>가격</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>판매</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{(product.category as any)?.name || "-"}</TableCell>
                    <TableCell>
                      {product.price === 0
                        ? "무료"
                        : `₩${product.price.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={product.is_published ? "default" : "secondary"}>
                          {product.is_published ? "공개" : "비공개"}
                        </Badge>
                        {product.is_featured && (
                          <Badge variant="outline">추천</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.sales_count || 0}회</TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/product/${product.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    등록된 제품이 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
