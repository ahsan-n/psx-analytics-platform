package model

import (
	"time"
)

// PSX Sector IDs and Names (based on PSX classification)
var PSXSectors = map[string]string{
	"banking-finance":           "Banking & Finance",
	"oil-gas":                   "Oil & Gas",
	"textiles":                  "Textiles",
	"cement":                    "Cement",
	"fertilizer":                "Fertilizer",
	"steel-engineering":         "Steel & Engineering",
	"chemicals-pharmaceuticals": "Chemicals & Pharmaceuticals",
	"food-agriculture":          "Food & Agriculture",
	"power-generation":          "Power Generation",
	"technology-telecom":        "Technology & Telecom",
	"automobile":                "Automobile",
	"real-estate":               "Real Estate",
	"miscellaneous":             "Miscellaneous",
}

// Sector represents a market sector in PSX
type Sector struct {
	ID                  string    `json:"id" db:"id"`
	Name                string    `json:"name" db:"name"`
	Description         string    `json:"description" db:"description"`
	MarketCap           float64   `json:"market_cap" db:"market_cap"`
	MarketCapPercentage float64   `json:"market_cap_percentage" db:"market_cap_percentage"`
	CompanyCount        int       `json:"company_count" db:"company_count"`
	VolumeToday         float64   `json:"volume_today" db:"volume_today"`
	TurnoverToday       float64   `json:"turnover_today" db:"turnover_today"`
	Volatility          float64   `json:"volatility" db:"volatility"`
	Beta                float64   `json:"beta" db:"beta"`
	LastUpdated         time.Time `json:"last_updated" db:"last_updated"`
}

// PerformanceData holds performance metrics for different timeframes
type PerformanceData struct {
	CurrentChange float64 `json:"current_change" db:"current_change"`
	OneWeek       float64 `json:"one_week" db:"one_week"`
	OneMonth      float64 `json:"one_month" db:"one_month"`
	ThreeMonths   float64 `json:"three_months" db:"three_months"`
	SixMonths     float64 `json:"six_months" db:"six_months"`
	OneYear       float64 `json:"one_year" db:"one_year"`
	YTD           float64 `json:"ytd" db:"ytd"`
}

// VolumeData holds volume and turnover metrics
type VolumeData struct {
	TodayVolume    float64 `json:"today_volume" db:"today_volume"`
	AvgVolume30D   float64 `json:"avg_volume_30d" db:"avg_volume_30d"`
	TodayTurnover  float64 `json:"today_turnover" db:"today_turnover"`
	AvgTurnover30D float64 `json:"avg_turnover_30d" db:"avg_turnover_30d"`
}

// SectorFinancials holds average financial ratios for the sector
type SectorFinancials struct {
	AvgPERatio       float64 `json:"avg_pe_ratio" db:"avg_pe_ratio"`
	AvgPBRatio       float64 `json:"avg_pb_ratio" db:"avg_pb_ratio"`
	AvgDividendYield float64 `json:"avg_dividend_yield" db:"avg_dividend_yield"`
	AvgROE           float64 `json:"avg_roe" db:"avg_roe"`
	AvgDebtToEquity  float64 `json:"avg_debt_to_equity" db:"avg_debt_to_equity"`
	MedianMarketCap  float64 `json:"median_market_cap" db:"median_market_cap"`
}

// Company represents a company within a sector
type Company struct {
	Symbol              string    `json:"symbol" db:"symbol"`
	Name                string    `json:"name" db:"name"`
	SectorID            string    `json:"sector_id" db:"sector_id"`
	MarketCap           float64   `json:"market_cap" db:"market_cap"`
	MarketCapPercentage float64   `json:"market_cap_percentage" db:"market_cap_percentage"`
	CurrentPrice        float64   `json:"current_price" db:"current_price"`
	ChangePercent       float64   `json:"change_percent" db:"change_percent"`
	Volume              float64   `json:"volume" db:"volume"`
	PERatio             float64   `json:"pe_ratio" db:"pe_ratio"`
	PBRatio             float64   `json:"pb_ratio" db:"pb_ratio"`
	DividendYield       float64   `json:"dividend_yield" db:"dividend_yield"`
	LastUpdated         time.Time `json:"last_updated" db:"last_updated"`
}

// MarketSummary represents overall market statistics
type MarketSummary struct {
	TotalMarketCap      float64   `json:"total_market_cap" db:"total_market_cap"`
	KSE100Index         float64   `json:"kse100_index" db:"kse100_index"`
	KSE100Change        float64   `json:"kse100_change" db:"kse100_change"`
	TotalVolume         float64   `json:"total_volume" db:"total_volume"`
	TotalTurnover       float64   `json:"total_turnover" db:"total_turnover"`
	AdvanceDeclineRatio float64   `json:"advance_decline_ratio" db:"advance_decline_ratio"`
	LastUpdated         time.Time `json:"last_updated" db:"last_updated"`
}

// ChartPoint represents a single point in time series data
type ChartPoint struct {
	Timestamp time.Time `json:"timestamp" db:"timestamp"`
	Value     float64   `json:"value" db:"value"`
	Volume    float64   `json:"volume" db:"volume"`
}

// MockDataGenerator provides realistic PSX data for development
type MockDataGenerator struct{}

func NewMockDataGenerator() *MockDataGenerator {
	return &MockDataGenerator{}
}

// GetSectorDescriptions returns detailed descriptions for each sector
func (m *MockDataGenerator) GetSectorDescriptions() map[string]string {
	return map[string]string{
		"banking-finance":           "Commercial banks, investment banks, insurance companies, and financial services including HBL, UBL, MCB Bank, and other major financial institutions",
		"oil-gas":                   "Oil and gas exploration, production, refining, and marketing companies including OGDC, PPL, PSO, and other energy sector companies",
		"textiles":                  "Textile manufacturing, spinning, weaving, and garment production companies representing Pakistan's largest export industry",
		"cement":                    "Cement manufacturing and building materials companies including Lucky Cement, DG Khan Cement, and other construction material producers",
		"fertilizer":                "Chemical fertilizer production and agricultural input companies supporting Pakistan's agricultural sector",
		"steel-engineering":         "Steel production, engineering goods, and heavy machinery companies including Pakistan Steel Mills and engineering firms",
		"chemicals-pharmaceuticals": "Chemical production, pharmaceutical manufacturing, and healthcare companies including GSK, Abbott, and local pharma companies",
		"food-agriculture":          "Food processing, agriculture, and consumer goods companies including Nestle Pakistan, National Foods, and agribusiness firms",
		"power-generation":          "Electricity generation, power distribution, and energy companies including independent power producers and utility companies",
		"technology-telecom":        "Technology services, telecommunications, and IT companies including Jazz, Telenor Pakistan, and tech service providers",
		"automobile":                "Automobile assembly, parts manufacturing, and automotive services including Honda Atlas, Toyota IMC, and auto parts companies",
		"real-estate":               "Real estate development, property management, and construction companies focusing on residential and commercial projects",
		"miscellaneous":             "Companies not classified in other specific sectors including diversified businesses and emerging industries",
	}
}

// GetSectorMarketData returns realistic market data based on actual PSX patterns
func (m *MockDataGenerator) GetSectorMarketData() map[string]SectorMarketData {
	return map[string]SectorMarketData{
		"banking-finance": {
			MarketCapBillion: 1250,
			CompanyCount:     35,
			BasePerformance:  2.5,
			TypicalPE:        8.5,
			TypicalPB:        0.9,
			DividendYield:    4.2,
			AvgROE:           15.5,
			DebtToEquity:     2.1,
		},
		"oil-gas": {
			MarketCapBillion: 890,
			CompanyCount:     18,
			BasePerformance:  -1.2,
			TypicalPE:        12.3,
			TypicalPB:        1.2,
			DividendYield:    6.8,
			AvgROE:           12.8,
			DebtToEquity:     0.8,
		},
		"textiles": {
			MarketCapBillion: 450,
			CompanyCount:     85,
			BasePerformance:  0.8,
			TypicalPE:        15.2,
			TypicalPB:        1.8,
			DividendYield:    3.5,
			AvgROE:           11.2,
			DebtToEquity:     1.5,
		},
		"cement": {
			MarketCapBillion: 380,
			CompanyCount:     22,
			BasePerformance:  1.5,
			TypicalPE:        11.8,
			TypicalPB:        1.4,
			DividendYield:    5.2,
			AvgROE:           16.3,
			DebtToEquity:     1.2,
		},
		"fertilizer": {
			MarketCapBillion: 320,
			CompanyCount:     8,
			BasePerformance:  3.2,
			TypicalPE:        9.5,
			TypicalPB:        1.1,
			DividendYield:    7.5,
			AvgROE:           18.2,
			DebtToEquity:     0.6,
		},
		"steel-engineering": {
			MarketCapBillion: 280,
			CompanyCount:     45,
			BasePerformance:  -0.5,
			TypicalPE:        14.2,
			TypicalPB:        1.6,
			DividendYield:    4.1,
			AvgROE:           10.8,
			DebtToEquity:     1.8,
		},
		"chemicals-pharmaceuticals": {
			MarketCapBillion: 250,
			CompanyCount:     28,
			BasePerformance:  2.1,
			TypicalPE:        16.5,
			TypicalPB:        2.2,
			DividendYield:    3.8,
			AvgROE:           14.7,
			DebtToEquity:     0.9,
		},
		"food-agriculture": {
			MarketCapBillion: 220,
			CompanyCount:     35,
			BasePerformance:  1.8,
			TypicalPE:        13.8,
			TypicalPB:        1.9,
			DividendYield:    4.5,
			AvgROE:           13.5,
			DebtToEquity:     1.1,
		},
		"power-generation": {
			MarketCapBillion: 180,
			CompanyCount:     25,
			BasePerformance:  -2.1,
			TypicalPE:        10.2,
			TypicalPB:        0.8,
			DividendYield:    8.2,
			AvgROE:           9.5,
			DebtToEquity:     2.5,
		},
		"technology-telecom": {
			MarketCapBillion: 160,
			CompanyCount:     15,
			BasePerformance:  4.5,
			TypicalPE:        18.5,
			TypicalPB:        2.8,
			DividendYield:    2.5,
			AvgROE:           16.8,
			DebtToEquity:     1.3,
		},
		"automobile": {
			MarketCapBillion: 120,
			CompanyCount:     18,
			BasePerformance:  0.3,
			TypicalPE:        12.5,
			TypicalPB:        1.5,
			DividendYield:    5.8,
			AvgROE:           12.2,
			DebtToEquity:     1.4,
		},
		"real-estate": {
			MarketCapBillion: 90,
			CompanyCount:     12,
			BasePerformance:  -1.8,
			TypicalPE:        8.8,
			TypicalPB:        0.7,
			DividendYield:    6.5,
			AvgROE:           8.2,
			DebtToEquity:     2.8,
		},
		"miscellaneous": {
			MarketCapBillion: 150,
			CompanyCount:     65,
			BasePerformance:  1.2,
			TypicalPE:        13.5,
			TypicalPB:        1.5,
			DividendYield:    4.0,
			AvgROE:           13.0,
			DebtToEquity:     1.3,
		},
	}
}

// SectorMarketData holds baseline market data for realistic simulation
type SectorMarketData struct {
	MarketCapBillion float64
	CompanyCount     int
	BasePerformance  float64
	TypicalPE        float64
	TypicalPB        float64
	DividendYield    float64
	AvgROE           float64
	DebtToEquity     float64
}

// GetTopCompaniesTemplates returns realistic company data templates
func (m *MockDataGenerator) GetTopCompaniesTemplates() map[string][]CompanyTemplate {
	return map[string][]CompanyTemplate{
		"banking-finance": {
			{"HBL", "Habib Bank Limited", 125.50},
			{"UBL", "United Bank Limited", 165.25},
			{"MCB", "MCB Bank Limited", 220.75},
			{"ABL", "Allied Bank Limited", 85.30},
			{"NBP", "National Bank of Pakistan", 42.80},
		},
		"oil-gas": {
			{"OGDC", "Oil & Gas Development Company", 85.30},
			{"PPL", "Pakistan Petroleum Limited", 95.60},
			{"PSO", "Pakistan State Oil", 145.80},
			{"SNGP", "Sui Northern Gas Pipelines", 45.20},
			{"SSGC", "Sui Southern Gas Company", 28.75},
		},
		"cement": {
			{"LUCK", "Lucky Cement Limited", 485.25},
			{"DGKC", "D.G. Khan Cement Company", 75.40},
			{"MLCF", "Maple Leaf Cement Factory", 32.15},
			{"CHCC", "Cherat Cement Company", 125.80},
			{"PIOC", "Pioneer Cement Limited", 68.95},
		},
		"textiles": {
			{"GATM", "Gul Ahmed Textile Mills", 45.80},
			{"KTML", "Kohinoor Textile Mills", 52.30},
			{"UNITY", "Unity Foods Limited", 28.75},
			{"SITC", "Sitara Chemical Industries", 285.60},
			{"LOTTE", "Lotte Chemical Pakistan", 18.25},
		},
		"fertilizer": {
			{"FFC", "Fauji Fertilizer Company", 125.75},
			{"EFERT", "Engro Fertilizers Limited", 68.90},
			{"FATIMA", "Fatima Fertilizer Company", 32.85},
		},
		// Add more sectors as needed
	}
}

// CompanyTemplate for generating realistic company data
type CompanyTemplate struct {
	Symbol string
	Name   string
	Price  float64
}
