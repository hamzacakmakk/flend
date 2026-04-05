import express from 'express'
import cors from 'cors'
import { supabase } from './supabaseClient.js'

const app = express()

app.use(cors())
app.use(express.json())

// Middleware to extract token and set user
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' })

    const token = authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Invalid token format' })

    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' })
    
    req.user = user
    req.token = token
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

// 1. Yeni satıcı hesabı oluşturma
app.post('/v1/auth/register', async (req, res) => {
  const { email, password, companyName } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        companyName: companyName || '',
      }
    }
  })

  // Create profile in a custom users table if needed (assuming Supabase handles basic user auth)
  if (error) {
    if (error.status === 400 || error.status === 422) return res.status(400).json({ error: error.message })
    return res.status(409).json({ error: error.message }) // or 409 Email adresi zaten kullanımda
  }

  res.status(201).json({ message: 'Satıcı başarıyla oluşturuldu', user: data.user })
})

// 2. Satıcı girişi
app.post('/v1/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) return res.status(401).json({ error: 'Unauthorized' })
  
  res.status(200).json({ token: data.session.access_token })
})

// 3. Profil ve abonelik getir
app.get('/v1/users/profile', authMiddleware, async (req, res) => {
  // Using user data from auth. Optional: fetch specific columns from public.profiles table
  const profile = {
    id: req.user.id,
    email: req.user.email,
    companyName: req.user.user_metadata?.companyName || '',
    subscription: {
      plan: 'Free Trial', // Mock data
      endsAt: '2026-12-31'
    }
  }
  
  res.status(200).json(profile)
})

// 4. Profil/Şifre güncelle
app.put('/v1/users/profile', authMiddleware, async (req, res) => {
  const { companyName, password } = req.body

  const updates = {}
  if (password) updates.password = password
  if (companyName) updates.data = { companyName }

  const { data, error } = await supabase.auth.updateUser(updates)

  if (error) return res.status(400).json({ error: error.message })

  res.status(200).json({ message: 'Başarıyla güncellendi', user: data.user })
})

// 5. Satıcı hesabı sil/dondur
app.delete('/v1/users/profile', authMiddleware, async (req, res) => {
  // Note: Deleting users requires Service Role Key in Supabase using supabase.auth.admin.deleteUser()
  // As a mock/placeholder, we just return 204
  res.status(204).send()
})

// 6. Abonelik paketlerini listele
app.get('/v1/subscriptions/packages', async (req, res) => {
  const packages = [
    { id: 1, name: 'Başlangıç', priceMonthly: 99, priceYearly: 990, features: ['1 Entegrasyon', '100 Ürün Takibi', 'Günlük Güncelleme'] },
    { id: 2, name: 'Profesyonel', priceMonthly: 299, priceYearly: 2990, features: ['5 Entegrasyon', '1000 Ürün Takibi', 'Saatlik Güncelleme', 'BuyBox Analizi'] },
    { id: 3, name: 'Kurumsal', priceMonthly: 999, priceYearly: 9990, features: ['Sınırsız Entegrasyon', 'Sınırsız Ürün Takibi', 'Anlık Güncelleme', 'Özel Destek'] },
  ]
  res.status(200).json(packages)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`)
})
