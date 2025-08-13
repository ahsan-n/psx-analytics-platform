package sector

import (
	"context"
	"errors"
	"math/rand"
	"sort"
	"time"

	"sector-service/internal/model"
	"sector-service/internal/svc"
	"sector-service/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetAllSectorsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// Get all PSX sectors overview
func NewGetAllSectorsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetAllSectorsLogic {
	return &GetAllSectorsLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetAllSectorsLogic) GetAllSectors(req *types.GetSectorsRequest) (resp *types.SectorsOverviewResponse, err error) {
	l.Infof("GetAllSectors called with timeframe: %s, sortBy: %s, sortOrder: %s",
		req.Timeframe, req.SortBy, req.SortOrder)

	// Validate parameters
	if err := l.validateRequest(req); err != nil {
		return nil, err
	}

	// Generate mock sector data
	mockGen := model.NewMockDataGenerator()
	sectors := l.generateSectorOverviews(mockGen, req.Timeframe)
	marketSummary := l.generateMarketSummary()

	// Sort sectors
	l.sortSectors(sectors, req.SortBy, req.SortOrder)

	resp = &types.SectorsOverviewResponse{
		Sectors:       sectors,
		MarketSummary: marketSummary,
		LastUpdated:   time.Now().Format(time.RFC3339),
	}

	l.Infof("Successfully generated %d sectors overview", len(sectors))
	return resp, nil
}

func (l *GetAllSectorsLogic) validateRequest(req *types.GetSectorsRequest) error {
	validTimeframes := []string{"1D", "1W", "1M", "3M", "6M", "1Y"}
	if !l.contains(validTimeframes, req.Timeframe) {
		return errors.New("invalid timeframe parameter")
	}

	validSortBy := []string{"market_cap", "performance", "volume", "company_count"}
	if !l.contains(validSortBy, req.SortBy) {
		return errors.New("invalid sort_by parameter")
	}

	validSortOrder := []string{"asc", "desc"}
	if !l.contains(validSortOrder, req.SortOrder) {
		return errors.New("invalid sort_order parameter")
	}

	return nil
}

func (l *GetAllSectorsLogic) generateSectorOverviews(mockGen *model.MockDataGenerator, timeframe string) []types.SectorOverview {
	var sectors []types.SectorOverview
	sectorData := mockGen.GetSectorMarketData()
	totalMarketCap := 4740.0 // Total in billions

	for sectorID, sectorName := range model.PSXSectors {
		data := sectorData[sectorID]
		marketCapBillion := data.MarketCapBillion
		marketCap := marketCapBillion * 1e9 // Convert to actual value

		performance := l.generatePerformanceMetrics(data.BasePerformance, timeframe)
		topCompanies := l.generateTopCompanies(mockGen, sectorID, 3)

		sector := types.SectorOverview{
			Id:                  sectorID,
			Name:                sectorName,
			MarketCap:           marketCap,
			MarketCapPercentage: (marketCapBillion / totalMarketCap) * 100,
			Performance:         performance,
			CompanyCount:        data.CompanyCount,
			VolumeToday:         l.randomFloat(1e6, 100e6),
			TurnoverToday:       l.randomFloat(500e6, 10e9),
			TopCompanies:        topCompanies,
		}

		sectors = append(sectors, sector)
	}

	return sectors
}

func (l *GetAllSectorsLogic) generatePerformanceMetrics(basePerformance float64, timeframe string) types.PerformanceMetrics {
	// Add some randomness to base performance
	variance := l.randomFloat(-1, 1)
	current := basePerformance + variance

	return types.PerformanceMetrics{
		CurrentChange: current,
		OneWeek:       current + l.randomFloat(-2, 2),
		OneMonth:      current + l.randomFloat(-5, 5),
		ThreeMonths:   current + l.randomFloat(-10, 15),
		SixMonths:     current + l.randomFloat(-15, 25),
		OneYear:       current + l.randomFloat(-25, 40),
		Ytd:           current + l.randomFloat(-20, 35),
	}
}

func (l *GetAllSectorsLogic) generateTopCompanies(mockGen *model.MockDataGenerator, sectorID string, count int) []types.TopCompany {
	templates := mockGen.GetTopCompaniesTemplates()
	sectorTemplates, exists := templates[sectorID]
	if !exists {
		// Generate generic companies for sectors without templates
		sectorTemplates = []model.CompanyTemplate{
			{"ABC", "ABC Limited", 100.00},
			{"DEF", "DEF Corporation", 150.00},
			{"GHI", "GHI Industries", 200.00},
		}
	}

	var companies []types.TopCompany
	for i, template := range sectorTemplates {
		if i >= count {
			break
		}

		changePercent := l.randomFloat(-5, 5)
		companies = append(companies, types.TopCompany{
			Symbol:        template.Symbol,
			Name:          template.Name,
			MarketCap:     l.randomFloat(50e9, 500e9),
			CurrentPrice:  template.Price * (1 + changePercent/100),
			ChangePercent: changePercent,
		})
	}

	return companies
}

func (l *GetAllSectorsLogic) generateMarketSummary() types.MarketSummary {
	kse100 := 45000 + l.randomFloat(-2000, 2000)
	change := l.randomFloat(-2, 2)

	return types.MarketSummary{
		TotalMarketCap:      4.74e12, // 4.74 trillion PKR
		Kse100Index:         kse100,
		Kse100Change:        change,
		TotalVolume:         l.randomFloat(100e6, 500e6),
		TotalTurnover:       l.randomFloat(10e9, 50e9),
		AdvanceDeclineRatio: l.randomFloat(0.3, 2.5),
		LastUpdated:         time.Now().Format(time.RFC3339),
	}
}

func (l *GetAllSectorsLogic) sortSectors(sectors []types.SectorOverview, sortBy, sortOrder string) {
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

func (l *GetAllSectorsLogic) randomFloat(min, max float64) float64 {
	return min + rand.Float64()*(max-min)
}

func (l *GetAllSectorsLogic) contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
