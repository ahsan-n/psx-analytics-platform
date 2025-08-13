package sector

import (
	"context"

	"sector-service/internal/svc"
	"sector-service/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type CompareSectorsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// Compare multiple sectors
func NewCompareSectorsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CompareSectorsLogic {
	return &CompareSectorsLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CompareSectorsLogic) CompareSectors(req *types.SectorCompareRequest) (resp *types.SectorCompareResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
