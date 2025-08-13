package sector

import (
	"context"

	"sector-service/internal/svc"
	"sector-service/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetSectorCompaniesLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// Get top companies in sector
func NewGetSectorCompaniesLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetSectorCompaniesLogic {
	return &GetSectorCompaniesLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetSectorCompaniesLogic) GetSectorCompanies(req *types.GetSectorCompaniesRequest) (resp *types.SectorCompaniesResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
