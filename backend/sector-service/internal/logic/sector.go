package logic

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"sort"
	"time"

	"github.com/ahsan-n/psx-analytics-platform/backend/sector-service/internal/model"
)

type SectorLogic struct {
	// In a real implementation, this would have database and external API clients
	// For now, we'll use mock data that simulates real PSX data
}

func NewSectorLogic() *SectorLogic {
	return &SectorLogic{}
}

// GetAllSectors returns overview of all PSX sectors
func (l *SectorLogic) GetAllSectors(ctx context.Context, timeframe, sortBy, sortOrder string) (*model.SectorsOverviewResponse, error) {
	sectors := l.generateMockSectors(timeframe)
	marketSummary := l.generateMockMarketSummary()

	// Sort sectors based on the requested criteria
	l.sortSectors(sectors, sortBy, sortOrder)

	return &model.SectorsOverviewResponse{
		Sectors:       sectors,
		MarketSummary: marketSummary,
		LastUpdated:   time.Now(),
	}, nil
}

// GetSectorDetails returns detailed analysis for a specific sector
func (l *SectorLogic) GetSectorDetails(ctx context.Context, sectorID, timeframe string) (*model.SectorDetailResponse, error) {
	// Validate sector ID
	sectorName, exists := model.PSXSectors[sectorID]
	if !exists {
		return nil, fmt.Errorf("sector not found: %s", sectorID)
	}

	sector := l.generateMockSectorDetail(sectorID, sectorName, timeframe)
	performanceChart := l.generateMockPerformanceChart(timeframe)
	financialMetrics := l.generateMockFinancialMetrics(sectorID)
	volumeMetrics := l.generateMockVolumeMetrics()
	companies := l.generateMockCompanies(sectorID, 20)

	return &model.SectorDetailResponse{
		Sector:           sector,
		PerformanceChart: performanceChart,
		FinancialMetrics: financialMetrics,
		VolumeMetrics:    volumeMetrics,
		Companies:        companies,
	}, nil
}

// GetSectorCompanies returns top companies in a sector
func (l *SectorLogic) GetSectorCompanies(ctx context.Context, sectorID string, limit int, sortBy string) ([]model.Company, error) {
	// Validate sector ID
	_, exists := model.PSXSectors[sectorID]
	if !exists {
		return nil, fmt.Errorf("sector not found: %s", sectorID)
	}

	companies := l.generateMockCompanies(sectorID, limit)

	// Sort companies based on criteria
	l.sortCompanies(companies, sortBy)

	if len(companies) > limit {
		companies = companies[:limit]
	}

	return companies, nil
}

// CompareSectors compares multiple sectors across specified metrics
func (l *SectorLogic) CompareSectors(ctx context.Context, sectorIDs []string, timeframe string, metrics []string) ([]model.SectorOverview, error) {
	var sectors []model.SectorOverview

	for _, sectorID := range sectorIDs {
		sectorName, exists := model.PSXSectors[sectorID]
		if !exists {
			return nil, fmt.Errorf("sector not found: %s", sectorID)
		}

		sector := l.generateMockSectorOverview(sectorID, sectorName, timeframe)
		sectors = append(sectors, sector)
	}

	return sectors, nil
}

// GetHealth returns service health status
func (l *SectorLogic) GetHealth(ctx context.Context) *model.HealthResponse {
	return &model.HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Version:   "1.0.0",
	}
}

// Helper methods for generating mock data (simulating real PSX data)

func (l *SectorLogic) generateMockSectors(timeframe string) []model.SectorOverview {
	var sectors []model.SectorOverview

	// Real PSX sector data approximations
	sectorData := map[string]struct {
		marketCapBillion float64
		companyCount     int
		basePerformance  float64
	}{
		"banking-finance":           {1250, 35, 2.5},
		"oil-gas":                   {890, 18, -1.2},
		"textiles":                  {450, 85, 0.8},
		"cement":                    {380, 22, 1.5},
		"fertilizer":                {320, 8, 3.2},
		"steel-engineering":         {280, 45, -0.5},
		"chemicals-pharmaceuticals": {250, 28, 2.1},
		"food-agriculture":          {220, 35, 1.8},
		"power-generation":          {180, 25, -2.1},
		"technology-telecom":        {160, 15, 4.5},
		"automobile":                {120, 18, 0.3},
		"real-estate":               {90, 12, -1.8},
		"miscellaneous":             {150, 65, 1.2},
	}

	totalMarketCap := 4740.0 // Total in billions

	for sectorID, sectorName := range model.PSXSectors {
		data := sectorData[sectorID]
		marketCapBillion := data.marketCapBillion
		marketCap := marketCapBillion * 1e9 // Convert to actual value

		performance := l.generatePerformanceMetrics(data.basePerformance, timeframe)
		topCompanies := l.generateTopCompanies(sectorID, 3)

		sector := model.SectorOverview{
			ID:                  sectorID,
			Name:                sectorName,
			MarketCap:           marketCap,
			MarketCapPercentage: (marketCapBillion / totalMarketCap) * 100,
			Performance:         performance,
			CompanyCount:        data.companyCount,
			VolumeToday:         l.randomFloat(1e6, 100e6),
			TurnoverToday:       l.randomFloat(500e6, 10e9),
			TopCompanies:        topCompanies,
		}

		sectors = append(sectors, sector)
	}

	return sectors
}

func (l *SectorLogic) generateMockSectorDetail(sectorID, sectorName, timeframe string) model.Sector {
	sectorOverview := l.generateMockSectorOverview(sectorID, sectorName, timeframe)

	return model.Sector{
		ID:                  sectorOverview.ID,
		Name:                sectorOverview.Name,
		Description:         l.getSectorDescription(sectorID),
		MarketCap:           sectorOverview.MarketCap,
		MarketCapPercentage: sectorOverview.MarketCapPercentage,
		CompanyCount:        sectorOverview.CompanyCount,
		Performance:         sectorOverview.Performance,
		VolumeToday:         sectorOverview.VolumeToday,
		TurnoverToday:       sectorOverview.TurnoverToday,
		Volatility:          l.randomFloat(15, 45),
		Beta:                l.randomFloat(0.7, 1.4),
		LastUpdated:         time.Now(),
	}
}

func (l *SectorLogic) generateMockSectorOverview(sectorID, sectorName, timeframe string) model.SectorOverview {
	sectors := l.generateMockSectors(timeframe)
	for _, sector := range sectors {
		if sector.ID == sectorID {
			return sector
		}
	}
	return model.SectorOverview{}
}

func (l *SectorLogic) generatePerformanceMetrics(basePerformance float64, timeframe string) model.PerformanceMetrics {
	// Add some randomness to base performance
	variance := l.randomFloat(-1, 1)
	current := basePerformance + variance

	return model.PerformanceMetrics{
		CurrentChange: current,
		OneWeek:       current + l.randomFloat(-2, 2),
		OneMonth:      current + l.randomFloat(-5, 5),
		ThreeMonths:   current + l.randomFloat(-10, 15),
		SixMonths:     current + l.randomFloat(-15, 25),
		OneYear:       current + l.randomFloat(-25, 40),
		YTD:           current + l.randomFloat(-20, 35),
	}
}

func (l *SectorLogic) generateTopCompanies(sectorID string, count int) []model.TopCompany {
	companyTemplates := map[string][]struct {
		symbol string
		name   string
		price  float64
	}{
		"banking-finance": {
			{"HBL", "Habib Bank Limited", 125.50},
			{"UBL", "United Bank Limited", 165.25},
			{"MCB", "MCB Bank Limited", 220.75},
		},
		"oil-gas": {
			{"OGDC", "Oil & Gas Development Company", 85.30},
			{"PPL", "Pakistan Petroleum Limited", 95.60},
			{"PSO", "Pakistan State Oil", 145.80},
		},
		"cement": {
			{"LUCK", "Lucky Cement Limited", 485.25},
			{"DGKC", "D.G. Khan Cement Company", 75.40},
			{"MLCF", "Maple Leaf Cement Factory", 32.15},
		},
		// Add more sector-specific companies as needed
	}

	templates, exists := companyTemplates[sectorID]
	if !exists {
		// Generate generic companies for sectors without templates
		templates = []struct {
			symbol string
			name   string
			price  float64
		}{
			{"ABC", "ABC Limited", 100.00},
			{"DEF", "DEF Corporation", 150.00},
			{"GHI", "GHI Industries", 200.00},
		}
	}

	var companies []model.TopCompany
	for i, template := range templates {
		if i >= count {
			break
		}

		changePercent := l.randomFloat(-5, 5)
		companies = append(companies, model.TopCompany{
			Symbol:        template.symbol,
			Name:          template.name,
			MarketCap:     l.randomFloat(50e9, 500e9),
			CurrentPrice:  template.price * (1 + changePercent/100),
			ChangePercent: changePercent,
		})
	}

	return companies
}

func (l *SectorLogic) generateMockCompanies(sectorID string, count int) []model.Company {
	var companies []model.Company

	for i := 0; i < count; i++ {
		symbol := fmt.Sprintf("%s%d", sectorID[0:3], i+1)
		name := fmt.Sprintf("Company %d in %s", i+1, model.PSXSectors[sectorID])

		changePercent := l.randomFloat(-10, 10)
		companies = append(companies, model.Company{
			Symbol:              symbol,
			Name:                name,
			SectorID:            sectorID,
			MarketCap:           l.randomFloat(1e9, 100e9),
			MarketCapPercentage: l.randomFloat(0.1, 10.0),
			CurrentPrice:        l.randomFloat(50, 500),
			ChangePercent:       changePercent,
			Volume:              l.randomFloat(10000, 1000000),
			PERatio:             l.randomFloat(8, 25),
			PBRatio:             l.randomFloat(0.5, 3.5),
			DividendYield:       l.randomFloat(0, 8),
			LastUpdated:         time.Now(),
		})
	}

	return companies
}

func (l *SectorLogic) generateMockPerformanceChart(timeframe string) model.PerformanceChart {
	var dataPoints []model.ChartDataPoint
	var duration time.Duration
	var interval time.Duration

	switch timeframe {
	case "1D":
		duration = 24 * time.Hour
		interval = 30 * time.Minute
	case "1W":
		duration = 7 * 24 * time.Hour
		interval = 4 * time.Hour
	case "1M":
		duration = 30 * 24 * time.Hour
		interval = 24 * time.Hour
	default:
		duration = 30 * 24 * time.Hour
		interval = 24 * time.Hour
	}

	startTime := time.Now().Add(-duration)
	baseValue := 100.0

	for t := startTime; t.Before(time.Now()); t = t.Add(interval) {
		// Generate realistic price movement
		change := l.randomFloat(-2, 2)
		baseValue += change
		if baseValue < 50 {
			baseValue = 50
		}

		dataPoints = append(dataPoints, model.ChartDataPoint{
			Timestamp: t,
			Value:     baseValue,
			Volume:    l.randomFloat(100000, 2000000),
		})
	}

	return model.PerformanceChart{
		Timeframe:  timeframe,
		DataPoints: dataPoints,
	}
}

func (l *SectorLogic) generateMockFinancialMetrics(sectorID string) model.SectorFinancialMetrics {
	// Sector-specific typical ratios
	sectorRatios := map[string]struct {
		peRatio      float64
		pbRatio      float64
		divYield     float64
		roe          float64
		debtToEquity float64
	}{
		"banking-finance": {8.5, 0.9, 4.2, 15.5, 2.1},
		"oil-gas":         {12.3, 1.2, 6.8, 12.8, 0.8},
		"textiles":        {15.2, 1.8, 3.5, 11.2, 1.5},
		"cement":          {11.8, 1.4, 5.2, 16.3, 1.2},
	}

	ratios, exists := sectorRatios[sectorID]
	if !exists {
		ratios = struct {
			peRatio      float64
			pbRatio      float64
			divYield     float64
			roe          float64
			debtToEquity float64
		}{13.5, 1.5, 4.0, 13.0, 1.3}
	}

	return model.SectorFinancialMetrics{
		AvgPERatio:       ratios.peRatio + l.randomFloat(-2, 2),
		AvgPBRatio:       ratios.pbRatio + l.randomFloat(-0.3, 0.3),
		AvgDividendYield: ratios.divYield + l.randomFloat(-1, 1),
		AvgROE:           ratios.roe + l.randomFloat(-3, 3),
		AvgDebtToEquity:  ratios.debtToEquity + l.randomFloat(-0.3, 0.3),
		MedianMarketCap:  l.randomFloat(5e9, 50e9),
	}
}

func (l *SectorLogic) generateMockVolumeMetrics() model.VolumeMetrics {
	todayVolume := l.randomFloat(1e6, 50e6)
	todayTurnover := l.randomFloat(500e6, 5e9)

	return model.VolumeMetrics{
		TodayVolume:    todayVolume,
		AvgVolume30D:   todayVolume * l.randomFloat(0.8, 1.2),
		TodayTurnover:  todayTurnover,
		AvgTurnover30D: todayTurnover * l.randomFloat(0.85, 1.15),
	}
}

func (l *SectorLogic) generateMockMarketSummary() model.MarketSummary {
	kse100 := 45000 + l.randomFloat(-2000, 2000)
	change := l.randomFloat(-2, 2)

	return model.MarketSummary{
		TotalMarketCap:      4.74e12, // 4.74 trillion PKR
		KSE100Index:         kse100,
		KSE100Change:        change,
		TotalVolume:         l.randomFloat(100e6, 500e6),
		TotalTurnover:       l.randomFloat(10e9, 50e9),
		AdvanceDeclineRatio: l.randomFloat(0.3, 2.5),
		LastUpdated:         time.Now(),
	}
}

func (l *SectorLogic) getSectorDescription(sectorID string) string {
	descriptions := map[string]string{
		"banking-finance":           "Commercial banks, investment banks, insurance companies, and financial services",
		"oil-gas":                   "Oil and gas exploration, production, refining, and marketing companies",
		"textiles":                  "Textile manufacturing, spinning, weaving, and garment production companies",
		"cement":                    "Cement manufacturing and building materials companies",
		"fertilizer":                "Chemical fertilizer production and agricultural input companies",
		"steel-engineering":         "Steel production, engineering goods, and heavy machinery companies",
		"chemicals-pharmaceuticals": "Chemical production, pharmaceutical manufacturing, and healthcare companies",
		"food-agriculture":          "Food processing, agriculture, and consumer goods companies",
		"power-generation":          "Electricity generation, power distribution, and energy companies",
		"technology-telecom":        "Technology services, telecommunications, and IT companies",
		"automobile":                "Automobile assembly, parts manufacturing, and automotive services",
		"real-estate":               "Real estate development, property management, and construction companies",
		"miscellaneous":             "Companies not classified in other specific sectors",
	}

	return descriptions[sectorID]
}

func (l *SectorLogic) sortSectors(sectors []model.SectorOverview, sortBy, sortOrder string) {
	sort.Slice(sectors, func(i, j int) bool {
		var less bool
		switch sortBy {
		case "market_cap":
			less = sectors[i].MarketCap < sectors[j].MarketCap
		case "performance":
			less = sectors[i].Performance.CurrentChange < sectors[j].Performance.CurrentChange
		case "volume":
			less = sectors[i].VolumeToday < sectors[j].VolumeToday
		case "company_count":
			less = sectors[i].CompanyCount < sectors[j].CompanyCount
		default:
			less = sectors[i].MarketCap < sectors[j].MarketCap
		}

		if sortOrder == "desc" {
			return !less
		}
		return less
	})
}

func (l *SectorLogic) sortCompanies(companies []model.Company, sortBy string) {
	sort.Slice(companies, func(i, j int) bool {
		switch sortBy {
		case "market_cap":
			return companies[i].MarketCap > companies[j].MarketCap
		case "performance":
			return companies[i].ChangePercent > companies[j].ChangePercent
		case "volume":
			return companies[i].Volume > companies[j].Volume
		case "pe_ratio":
			return companies[i].PERatio < companies[j].PERatio
		default:
			return companies[i].MarketCap > companies[j].MarketCap
		}
	})
}

func (l *SectorLogic) randomFloat(min, max float64) float64 {
	return min + rand.Float64()*(max-min)
}

// JSON serialization helpers for debugging
func (l *SectorLogic) toJSON(v interface{}) string {
	b, _ := json.MarshalIndent(v, "", "  ")
	return string(b)
}
