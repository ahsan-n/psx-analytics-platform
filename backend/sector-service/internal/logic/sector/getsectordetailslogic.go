package sector

import (
	"context"

	"sector-service/internal/svc"
	"sector-service/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetSectorDetailsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// Get detailed sector analysis
func NewGetSectorDetailsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetSectorDetailsLogic {
	return &GetSectorDetailsLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetSectorDetailsLogic) GetSectorDetails(req *types.GetSectorDetailsRequest) (resp *types.SectorDetailResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
