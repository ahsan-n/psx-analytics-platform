package sector

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
	"sector-service/internal/logic/sector"
	"sector-service/internal/svc"
	"sector-service/internal/types"
)

// Get all PSX sectors overview
func GetAllSectorsHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetSectorsRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := sector.NewGetAllSectorsLogic(r.Context(), svcCtx)
		resp, err := l.GetAllSectors(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
