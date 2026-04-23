import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../api/client'
import { getProductImage } from '../../utils/productImage'
import { Skeleton } from '../../components/ui/Skeleton'
import StatCard from '../../components/ui/StatCard'

const initialProduct = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  image: '',
}

function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0 })
  const [form, setForm] = useState(initialProduct)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const totalInventory = products.reduce((sum, p) => sum + Number(p.stock || 0), 0)
  const lowStockCount = products.filter((p) => Number(p.stock || 0) <= 5).length
  const catalogValue = products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const [{ data: productData }, { data: analyticsData }] = await Promise.all([
        api.get('/products'),
        api.get('/users/admin/analytics').catch(() => ({ data: { totalUsers: 0, totalOrders: 0, totalRevenue: 0 } })),
      ])
      setProducts(Array.isArray(productData) ? productData : [])
      setAnalytics({
        totalUsers: Number(analyticsData?.totalUsers || 0),
        totalOrders: Number(analyticsData?.totalOrders || 0),
        totalRevenue: Number(analyticsData?.totalRevenue || 0),
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount load
    fetchProducts()
  }, [])

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    try {
      setUploading(true)
      const body = new FormData()
      body.append('image', file)
      const { data } = await api.post('/upload', body)
      setForm((prev) => ({ ...prev, image: data.url }))
      toast.success('Image uploaded')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed — try an image URL instead')
    } finally {
      setUploading(false)
    }
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form)
        toast.success('Product updated')
      } else {
        await api.post('/products', form)
        toast.success('Product created')
      }
      setForm(initialProduct)
      setEditingId('')
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save product')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product removed')
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  }

  const startEditing = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Manage products</h1>
        <p className="section-subtitle">
          Create catalog items, upload images via Cloudinary, and keep inventory accurate.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Products" value={products.length} />
        <StatCard label="Units in stock" value={totalInventory} tone="emerald" />
        <StatCard label="Low stock alerts" value={lowStockCount} tone="amber" />
        <StatCard label="Total users" value={analytics.totalUsers} />
        <StatCard label="Total orders" value={analytics.totalOrders} tone="indigo" />
        <StatCard label="Revenue" value={`$${analytics.totalRevenue.toFixed(2)}`} tone="emerald" />
      </section>

      <section className="surface-card animate-enter p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? 'Edit product' : 'Add product'}
        </h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleProductSubmit}>
          {['name', 'category', 'price', 'stock'].map((field) => (
            <label key={field} className="block text-sm">
              <span className="mb-1 block font-medium capitalize text-slate-700">{field}</span>
              <input
                required={field !== 'stock'}
                type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                min={field === 'price' || field === 'stock' ? '0' : undefined}
                step={field === 'price' ? '0.01' : '1'}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                value={form[field]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Description</span>
            <textarea
              required
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Image URL</span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              placeholder="https://… or upload below"
              value={form.image}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
            />
          </label>
          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Upload image (Cloudinary)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={handleImageFile}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
            />
            {uploading ? <p className="mt-2 text-xs text-slate-500">Uploading…</p> : null}
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700"
            >
              {editingId ? 'Save changes' : 'Add product'}
            </button>
            {editingId ? (
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
                onClick={() => {
                  setEditingId('')
                  setForm(initialProduct)
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="animate-enter">
        <h2 className="text-lg font-semibold text-slate-900">Catalog</h2>
        <p className="mt-1 text-xs text-slate-500">Estimated stock value: ${catalogValue.toFixed(2)}</p>
        <div className="table-shell mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Product</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Price</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Stock</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={4} className="px-4 py-3">
                          <Skeleton className="h-10 w-full" />
                        </td>
                      </tr>
                    ))
                  : products.map((product, index) => (
                      <tr key={product._id} className="table-row">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImage(product, index)}
                              alt=""
                              className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                              loading="lazy"
                            />
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-xs text-slate-500">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          ${Number(product.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{product.stock}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(product)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product._id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {!loading && products.length === 0 ? (
            <p className="bg-white px-4 py-8 text-center text-sm text-slate-500">No products yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default AdminProductsPage
