# Vercel CLI가 Windows 한글 사용자명에서 실패할 때 토큰으로 배포
# 사용법:
#   $env:VERCEL_TOKEN = "토큰"  # https://vercel.com/account/settings/tokens
#   .\scripts\deploy-vercel.ps1

if (-not $env:VERCEL_TOKEN) {
  Write-Error "VERCEL_TOKEN 환경변수가 필요합니다."
  exit 1
}

$env:VITE_SUPABASE_URL = "https://zikzohexsqnscfzvvzxt.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "sb_publishable_raVj68nvxg_qeTSTsiMkKw_G1DZR0E_"
$env:VITE_SITE_PASSWORD = "znznzn"

Set-Location $PSScriptRoot + "\.."
npx vercel deploy --prod --yes --token $env:VERCEL_TOKEN
